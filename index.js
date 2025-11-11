/**
 * @module kojo
 */

import path from 'path';
import url from 'url';
import fs from 'fs'; const readDir = promisify(fs.readdir);
import { promisify } from 'util';
import { EventEmitter } from 'events';
import TrID from 'trid';
import Service from './lib/Service.js';
import Logger from'./lib/Logger.js';
import  { getParentPackageInfo } from './lib/util.js';
import kojoPackage from './package.json' with { type: 'json' };


/**
 * The Kojo class
 *
 * @class
 * @alias module:kojo
 * @example
 * ```js
 * const kojo = new Kojo({
 *     name: 'users',
 *     icon: 👥
 * });
 * ```
 */
class Kojo extends EventEmitter {

    /**
     * Create Kojo instance
     *
     * @param options {Object} - configuration options
     * @param options.subsDir {string} - subscribers directory (relative to project root)
     * @param options.functionsDir {string} - functions directory (relative to project root, default: 'functions', alternative: 'ops')
     * @param options.serviceDir {string} - DEPRECATED: use functionsDir instead
     * @param options.parentPackage {Object} - parent package, Kojo is running from. Needed to just display
     *                                         parent package name version. Default is current project package.json
     * @param options.name {string} - Kojo name (default `工場`)
     * @param options.icon {string} - Kojo icon, usually an emoji (default `☢`)
     * @param options.logLevel {string} - the log level (default: `debug`)
     * @param options.loggerIdSuffix {boolean} - shall logger use Kojo ID prefix? (default: false)
     */
    constructor(options={}) {

        super();

        const defaults = {
            subsDir: 'subscribers',
            functionsDir: 'functions',
            parentPackage: null,
            name: '工場',
            icon: '☢',
            logLevel: 'debug',
            loggerIdSuffix: false
        };
        this._options = options;

        // Backward compatibility: support deprecated serviceDir option
        if (options.serviceDir && !options.functionsDir) {
            process.stderr.write('\x1b[33mWarning: "serviceDir" is deprecated. Please use "functionsDir" instead.\x1b[0m\n');
            options.functionsDir = options.serviceDir;
        }

        /**
         * Kojo instance configuration
         *
         * @type Object
         */
        this.config = Object.assign(defaults, this._options);
        const { name } = this.config;
        const id = new TrID();

        /**
         * Kojo instance unique ID
         *
         * @type string
         * @example
         * ```
         * user-service.zM8n6
         * ```
         */
        this.id = id.base();

        /**
         * Kojo name
         *
         * @type string
         * @example
         * ```
         * user-service
         * ```
         */
        this.name = name;

        this.state = {};
        this._subscribers = [];
    }

    /**
     * Bootstrap Kojo instance. Resolves after every service and
     * subscriber has been loaded. Always `await` for it before using Kojo
     * instance.
     *
     * @instance
     * @return {Promise}
     * @fulfil {Array} - 'tuple' with services and endpoints count
     * @example
     * ```js
     * const kojo = new Kojo(options);
     * await kojo.ready();
     * ```
     */
    async ready() {

        const kojo = this;

        if (! kojo.config.parentPackage)
            kojo.config.parentPackage = (await getParentPackageInfo()).default;

        const { icon, logLevel, parentPackage } = kojo.config;

        process.stdout.write('\n*************************************************************\n');
        process.stdout.write(`  ${icon} ${kojo.id}  |  ${parentPackage.name}@${parentPackage.version}  |  ${kojoPackage.name}@${kojoPackage.version}\n`);
        process.stdout.write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

        // FUNCTIONS

        const functionsDir = path.join(process.cwd(), kojo.config.functionsDir);
        const functionsAlias = path.basename(kojo.config.functionsDir);
        kojo[functionsAlias] = {};

        try {
            const fnEntries = await readDir(functionsDir);
            process.stdout.write(`    ${icon} loading ${functionsAlias}...`);

            // Load folder-based functions
            for (const entry of fnEntries) {
                const entryPath = path.join(functionsDir, entry);

                if (! fs.lstatSync(entryPath).isDirectory())
                    continue;

                const fnGroupName = path.basename(entryPath);
                const service = new Service(fnGroupName, entryPath, kojo);
                kojo[functionsAlias][fnGroupName] = await service.ready();
            }

            // Load root-level functions
            for (const entry of fnEntries) {
                const entryPath = path.join(functionsDir, entry);

                // Skip directories
                if (fs.lstatSync(entryPath).isDirectory())
                    continue;

                // Skip non-JS files
                if (! entry.endsWith('.js'))
                    continue;

                const functionName = path.basename(entry, '.js');

                // Skip test files
                if (functionName === 'test')
                    continue;

                const { default: fn } = await import(url.pathToFileURL(entryPath));
                kojo[functionsAlias][functionName] = Service.wrapFunction(fn, kojo, [ functionName ]);
            }

            process.stdout.write(` done (${Object.keys(kojo[functionsAlias]).length})\n`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === functionsDir && !kojo._options.functionsDir)
                process.stdout.write(`    ${icon} skipping ${functionsAlias}\n`);
            else {
                process.stderr.write(error.message);
                throw error;
            }
        }

        // SUBSCRIBERS

        const subsDir = path.join(process.cwd(), kojo.config.subsDir);
        try {
            const subscriberFiles = await readDir(subsDir);
            const subsAlias = path.basename(kojo.config.subsDir);
            process.stdout.write(`    ${icon} loading ${subsAlias}...`);

            await Promise.all(subscriberFiles.map(async (subscriberFile) => {
                    const subName = path.basename(subscriberFile, '.js');
                    const importPath = path.join(subsDir, subscriberFile);
                    kojo._subscribers.push(subName);
                    const subsWrapper = await import(url.pathToFileURL(importPath));
                    const loggerId = kojo.config.loggerIdSuffix ? [ kojo.name, kojo.id ].join('.') : kojo.name;
                    return subsWrapper.default(kojo, new Logger({
                        id: loggerId, icon,
                        level: logLevel,
                        tagPieces: [ subName ],
                        color: 'bold' }))
                }
            ));

            process.stdout.write(` done (${kojo._subscribers.length})\n`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === subsDir && !kojo._options.subsDir) {
                process.stdout.write(`    ${icon} skipping subscribers\n`);
            } else {
                process.stderr.write(error.message);
                throw error;
            }
        }

        process.stdout.write(`    ${icon} kojo "${kojo.name}" ready [${process.env.NODE_ENV}]\n`);
        process.stdout.write('*************************************************************\n');
        return [ Object.keys(kojo[functionsAlias]).length, kojo._subscribers.length ];
    }

    /**
     * Set key/value to the global context. Anything goes here - DB, transport connections,
     * configuration objects, etc. This is also called setting an 'extra'.
     *
     * @instance
     * @param {string} key - key string
     * @param {*} value - value of any type
     * @example
     * ```js
     * const client = await MongoClient.connect(config.mongodb.url);
     * kojo.set('mongo', client);
     * ```
     */
    set(key, value) {
        this.state[key] = value;
    }

    /**
     * Get (previously `set`) value from state.
     *
     * @instance
     * @param {string=} key - key string (optional). If omitted, returns state object.
     * @returns {*}
     * @example
     * ```js
     * const client = await MongoClient.connect(config.mongodb.url);
     * kojo.get('mongo');
     * ```
     */
    get(key) {
        return key ? this.state[key] : this.state;
    }

}

export default Kojo;
