const path = require('path');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const {promisify} = require('util');
const merge = require('lodash/merge');
const trid = require('trid');
const forEach = require('lodash/forEach');
const Module = require('./lib/Module');
const logger = require('./lib/logger');
const pack = require('./package');


const readDir = promisify(fs.readdir);


module.exports = class extends EventEmitter {

    constructor (name, options, packageInfo={}) {
        super();
        const defaults = {
            subsDir: 'subscribers',
            modulesDir: 'modules',
            icon: '☢'
        };
        const kojo = this;
        const id = new trid({prefix: name});
        kojo.id = id.base();
        kojo.name = name;
        kojo.config = options ? merge(defaults, options) : defaults;
        kojo._extras = {};
        kojo._modules = {};
        kojo._pack = packageInfo;
        kojo._subscribers = [];
    }

    async ready() {

        const kojo = this;
        const icon = kojo.config.icon;

        console.log('*************************************************************');
        console.log(`  ${icon} ${kojo.id}  |  ${kojo._pack.name}@${kojo._pack.version}  |  ${pack.name}@${pack.version}`);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        process.stdout.write(`    ${icon} loading modules...`);
        const modulesDir = path.join(process.cwd(), kojo.config.modulesDir);
        const moduleDirs = await readDir(modulesDir);
        try {
            forEach(moduleDirs, (moduleDir) => {
                const modulePath = path.join(modulesDir, moduleDir);
                if (!fs.lstatSync(modulePath).isDirectory()) return;
                const moduleName = path.basename(modulePath);
                kojo._modules[moduleName] = new Module(moduleName, modulePath, kojo);
            });
            console.log('done');
        } catch (error) {
            console.log('error');
            throw error;
        }


        console.log(`    ${icon} loading subscribers`);
        const subsDir = path.join(process.cwd(), kojo.config.subsDir);
        const subscriberFiles = await readDir(subsDir);
        const subsDone = [];
        forEach(subscriberFiles, async (subscriberFile) => {
            const subName = path.basename(subscriberFile, '.js');
            const requirePath = path.join(subsDir, subscriberFile);
            kojo._subscribers.push(subName);
            let subsWrapper = require(requirePath);
            subsDone.push(subsWrapper(kojo, logger(kojo, 'sub', subName)));
        });
        await Promise.all(subsDone);
        console.log(`    ${icon} ${kojo.name} ready`);

        console.log('*************************************************************');
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
