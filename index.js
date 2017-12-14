const path = require('path');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const {promisify} = require('util');
const merge = require('lodash/merge');
const shortid = require('shortid');
const forEach = require('lodash/forEach');
const configLoader = require('yt-config');
const Module = require('./lib/Module');
const logger = require('./lib/logger');


const readDir = promisify(fs.readdir);


module.exports = class extends EventEmitter {

    constructor (name, options, packageInfo={}) {
        super();
        const defaults = {
            subsDir: 'subscribers',
            modulesDir: 'modules',
            configFile: 'config.ini'
        };
        const plant = this;
        plant.id = shortid.generate();
        plant.name = name;
        plant.config = options ? merge(defaults, options) : defaults;
        plant._extras = {};
        plant._modules = {};
        plant._packageInfo = packageInfo;
        plant._subscribers = [];
    }

    async ready() {

        const plant = this;
        process.stdout.write('  ☢ loading config...');
        const config = await configLoader(plant.config.configFile);
        plant.config = merge(plant.config, config);
        console.log('done');

        process.stdout.write('  ☢ loading modules...');
        const modulesDir = path.join(process.cwd(), plant.config.modulesDir);
        const moduleDirs = await readDir(modulesDir);
        forEach(moduleDirs, (moduleDir) => {
            const modulePath = path.join(modulesDir, moduleDir);
            if (!fs.lstatSync(modulePath).isDirectory()) return;
            const moduleName = path.basename(modulePath);
            plant._modules[moduleName] = new Module(moduleName, modulePath, plant);
        });
        console.log('done');

        process.stdout.write('  ☢ loading subscribers...');
        const subsDir = path.join(process.cwd(), plant.config.subsDir);
        const subscriberFiles = await readDir(subsDir);
        forEach(subscriberFiles, (subscriberFile) => {
            const subName = path.basename(subscriberFile, '.js');
            const requirePath = path.join(subsDir, subscriberFile);
            plant._subscribers.push(subName);
            let subsWrapper = require(requirePath);
            subsWrapper(plant, logger(plant.name, 'sub', subName));
        });
        console.log('done');
    }

    set(key, value) {
        this._extras[key] = value;
    }

    get(key) {
        return this._extras[key];
    }

    module(name) {
        if (!this._modules[name]) throw new Error(`module '${name}' is either not loaded yet or unknown`);
        return this._modules[name];
    }

};
