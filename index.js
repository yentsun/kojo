/**
 * @module kojo
 */

const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const readDir = promisify(fs.readdir);
const merge = require('lodash.merge');
const pino = require('pino');
const trid = require('trid');
const Module = require('./lib/Module');
const logger = require('./lib/logger');
const {getParentPackageInfo} = require('./lib/util');
const kojoPackage = require('./package');


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
class Kojo {

    /**
     * Create Kojo instance
     *
     * @param options {Object} - configuration options
     * @param options.subsDir {String} - subscribers directory (relative to project root)
     * @param options.modulesDir {String} - subscribers directory (relative to project root)
     * @param options.parentPackage {Object} - parent package, Kojo is running from. Needed to just display
     *                                         parent package name version. Default is current project package.json
     * @param options.name {String} - Kojo name (default `工場`)
     * @param options.icon {String} - Kojo icon, usually an emoji (default `☢`)
     * @param options.logger {Object} - logger (default: smart logger based on Pino)
     */
    constructor(options) {

        const defaults = {
            subsDir: 'subscribers',
            modulesDir: 'modules',
            parentPackage: getParentPackageInfo(),
            name: '工場',
            icon: '☢',
            logger: {}
        };
        this._options = options;
        /**
         * Kojo instance configuration
         *
         * @type Object
         */
        this.config = this._options ? merge(defaults, this._options) : defaults;
        const {name} = this.config;
        const id = new trid({prefix: name});

        /**
         * Kojo instance unique ID
         *
         * @type String
         * @example
         * ```
         * user-service.zM8n6
         * ```
         */
        this.id = id.base();

        /**
         * Kojo name
         *
         * @type String
         * @example
         * ```
         * user-service
         * ```
         */
        this.name = name;
        /**
         * Logger instance
         *
         * @type String
         * @example
         * ```
         * kojo.logger.info('server started')
         * ```
         */
        this.logger = pino(options.logger);

        this._extras = {};
        /**
         * Loaded modules found in the modules directory;
         * if a module has methods, they will be available through dot notation.
         *
         * @type Object
         * @example
         * ```js
         * const {user, profile} = kojo.modules;
         * user.create({...});
         * profile.update({...})
         * ```
         */
        this.modules = {};
        this._subscribers = [];
    }

    /**
     * Bootstrap Kojo instance. Resolves after every module and
     * subscriber has been loaded. Always `await` for it before using Kojo
     * instance.
     *
     * @instance
     * @return {Promise}
     * @fulfil {undefined}
     * @example
     * ```js
     * const kojo = new Kojo(options);
     * await kojo.ready();
     * ```
     */
    async ready() {

        const kojo = this;
        const {icon, parentPackage} = kojo.config;

        process.stdout.write('*************************************************************\n');
        process.stdout.write(`  ${icon} ${kojo.id}  |  ${parentPackage.name}@${parentPackage.version}  |  ${kojoPackage.name}@${kojoPackage.version}\n`);
        process.stdout.write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

        // MODULES

        const modulesDir = path.join(process.cwd(), kojo.config.modulesDir);
        try {
            const moduleDirs = await readDir(modulesDir);
            process.stdout.write(`    ${icon} loading modules...`);
            moduleDirs.forEach((moduleDir) => {
                const modulePath = path.join(modulesDir, moduleDir);
                if (!fs.lstatSync(modulePath).isDirectory()) return;
                const moduleName = path.basename(modulePath);
                kojo.modules[moduleName] = new Module(moduleName, modulePath, kojo);
            });
            process.stdout.write(` done (${Object.keys(kojo.modules).length})\n`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === modulesDir && !kojo._options.modulesDir)
                process.stdout.write(`    ${icon} skipping modules\n`);
            else {
                process.stdout.write('error\n');
                throw error;
            }
        }

        // SUBSCRIBERS

        const subsDir = path.join(process.cwd(), kojo.config.subsDir);
        try {
            const subsDone = [];
            const subscriberFiles = await readDir(subsDir);
            const subsAlias = path.basename(kojo.config.subsDir);
            process.stdout.write(`    ${icon} loading ${subsAlias}...`);
            subscriberFiles.forEach(async (subscriberFile) => {
                const subName = path.basename(subscriberFile, '.js');
                const requirePath = path.join(subsDir, subscriberFile);
                kojo._subscribers.push(subName);
                let subsWrapper = require(requirePath);

                subsDone.push(subsWrapper(kojo, logger(kojo, 'sub', subName)));
            });
            await Promise.all(subsDone);
            process.stdout.write(` done (${Object.keys(kojo._subscribers).length})\n`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === subsDir) {
                process.stdout.write(`    ${icon} skipping subscribers\n`);
            } else
                throw error;
        }

        process.stdout.write(`    ${icon} kojo "${kojo.name}" ready\n`);
        process.stdout.write('*************************************************************\n');
    }

    /**
     * Set global context key/value. Anything goes here - DB, transport connections,
     * configuration objects, etc. This is also called setting an 'extra'.
     *
     * @instance
     * @param {String} key - key string
     * @param {*} value - value of any type
     * @example
     * ```js
     * const client = await MongoClient.connect(config.mongodb.url);
     * kojo.set('mongo', client);
     * ```
     */
    set(key, value) {
        this._extras[key] = value;
    }

    /**
     * Get (previously `set`) value from global context.
     *
     * @instance
     * @param {String=} key - key string (optional). If omitted, returns all extras,
     *                        which is useful for destructing syntax
     * @returns {*}
     * @example
     * ```js
     * const client = await MongoClient.connect(config.mongodb.url);
     * kojo.set('mongo', client);
     * ```
     */
    get(key) {
        // TODO handle missing key
        return key ? this._extras[key]: this._extras;
    }

}

module.exports = Kojo;
