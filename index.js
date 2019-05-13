/**
 * @module kojo
 */

const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const {EventEmitter} = require('events');
const readDir = promisify(fs.readdir);
const TrID = require('trid');
const Service = require('./lib/Service');
const Logger = require('./lib/Logger');
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
class Kojo extends EventEmitter {

    /**
     * Create Kojo instance
     *
     * @param options {Object} - configuration options
     * @param options.subsDir {string} - subscribers directory (relative to project root)
     * @param options.serviceDir {string} - service directory (relative to project root)
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
            serviceDir: 'services',
            parentPackage: getParentPackageInfo(),
            name: '工場',
            icon: '☢',
            logLevel: 'debug',
            loggerIdSuffix: false
        };
        this._options = options;
        /**
         * Kojo instance configuration
         *
         * @type Object
         */
        this.config = Object.assign(defaults, this._options);
        const {name} = this.config;
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
        /**
         * Loaded services found in the services directory;
         * if a service has methods, they will be available through dot notation.
         *
         * @type Object
         * @example
         * ```js
         * const {user, profile} = kojo.services;
         * user.create({...});
         * profile.update({...})
         * ```
         */
        this.services = {};
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
        const {icon, parentPackage, logLevel} = kojo.config;

        process.stdout.write('\n*************************************************************\n');
        process.stdout.write(`  ${icon} ${kojo.id}  |  ${parentPackage.name}@${parentPackage.version}  |  ${kojoPackage.name}@${kojoPackage.version}\n`);
        process.stdout.write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');

        // SERVICES

        const servicesDir = path.join(process.cwd(), kojo.config.serviceDir);
        try {
            const serviceDirs = await readDir(servicesDir);
            process.stdout.write(`    ${icon} loading services...`);
            serviceDirs.forEach((srvDir) => {
                const servicePath = path.join(servicesDir, srvDir);
                if (!fs.lstatSync(servicePath).isDirectory()) return;
                const serviceName = path.basename(servicePath);
                kojo.services[serviceName] = new Service(serviceName, servicePath, kojo);
            });
            process.stdout.write(` done (${Object.keys(kojo.services).length})\n`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === servicesDir && !kojo._options.serviceDir)
                process.stdout.write(`    ${icon} skipping services\n`);
            else {
                process.stderr.write(error.message);
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

                const loggerId = kojo.config.loggerIdSuffix ? [kojo.name, kojo.id].join('.') : kojo.name;
                subsDone.push(subsWrapper(kojo, new Logger({id: loggerId, icon, level: logLevel, tagPieces: [subName], color: 'bold'})));
            });
            await Promise.all(subsDone);
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
        return [ Object.keys(kojo.services).length, kojo._subscribers.length ];
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

module.exports = Kojo;
