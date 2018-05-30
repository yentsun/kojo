const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const readDir = promisify(fs.readdir);
const merge = require('lodash.merge');
const trid = require('trid');
const Module = require('./lib/Module');
const logger = require('./lib/logger');
const {getParentPackageInfo} = require('./lib/util');
const kojoPackage = require('./package');


module.exports = class {

    constructor(options) {

        const defaults = {
            subsDir: 'subscribers',
            modulesDir: 'modules',
            parentPackage: getParentPackageInfo(),
            name: '工場',
            icon: '☢'
        };
        this._options = options;
        this.config = this._options ? merge(defaults, this._options) : defaults;
        const {name} = this.config;
        const id = new trid({prefix: name});
        this.id = id.base();
        this.name = name;
        this._extras = {};
        this.modules = {};
        this._subscribers = [];
    }

    async ready() {

        const kojo = this;
        const {icon, parentPackage} = kojo.config;

        console.log('*************************************************************');
        console.log(`  ${icon} ${kojo.id}  |  ${parentPackage.name}@${parentPackage.version}  |  ${kojoPackage.name}@${kojoPackage.version}`);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

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
            console.log(` done (${Object.keys(kojo.modules).length})`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === modulesDir && !kojo._options.modulesDir)
                console.log(`    ${icon} skipping modules`);
            else {
                console.log('error');
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
            console.log(` done (${Object.keys(kojo._subscribers).length})`);
        } catch (error) {
            if (error.code === 'ENOENT' && error.path === subsDir) {
                console.log(`    ${icon} skipping subscribers`);
            } else
                throw error;
        }

        console.log(`    ${icon} kojo "${kojo.name}" ready`);
        console.log('*************************************************************');
    }

    set(key, value) {
        this._extras[key] = value;
    }

    get(key) {
        return key ? this._extras[key]: this._extras;
    }

};
