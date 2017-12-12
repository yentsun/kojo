const path = require('path');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const series = require('async/series');
const merge = require('lodash/merge');
const shortid = require('shortid');
const forEach = require('lodash/forEach');
const configLoader = require('ini-config');
const Module = require('./lib/Module');
const logger = require('./lib/logger');


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

        this.readyPromise=new Promise((resolve) =>{
            plant.on('ready', () =>{
                resolve();
            })
        });

        this.configPromise=new Promise((resolve) =>{
            plant.on('config', (config) =>{
                resolve(config);
            })
        });

        series([

            function loadConfig(done) {
                process.stdout.write('  ☢ loading config...');
                configLoader(plant.config.configFile, (error, config) => {
                    if (error) return done(error);
                    console.log('done');
                    plant.config = merge(plant.config, config);
                    plant.emit('config', plant.config);
                    done();
                });
            },

            function initNats (done) {
                done();
            },

            function loadModules(done) {
                process.stdout.write('  ☢ loading modules...');
                const modulesDir = path.join(process.cwd(), plant.config.modulesDir);
                fs.readdir(modulesDir, (error, moduleDirs) => {
                    if (error) return done(error);
                    forEach(moduleDirs, (moduleDir) => {
                        const modulePath = path.join(modulesDir, moduleDir);
                        if (!fs.lstatSync(modulePath).isDirectory()) return;
                        const moduleName = path.basename(modulePath);
                        plant._modules[moduleName] = new Module(moduleName, modulePath, plant);
                    });
                    console.log('done');
                    done();
                });
            },

            function loadSubscribers(done) {
                process.stdout.write('  ☢ loading subscribers...');
                const subsDir = path.join(process.cwd(), plant.config.subsDir);
                fs.readdir(subsDir, (error, subscriberFiles) => {
                    if (error) return done(error);
                    forEach(subscriberFiles, (subscriberFile) => {
                        const subName = path.basename(subscriberFile, '.js');
                        const requirePath = path.join(subsDir, subscriberFile);
                        plant._subscribers.push(subName);
                        let subsWrapper = require(requirePath);
                        if(typeof subsWrapper === 'object'){
                            // for ES6 exports
                            subsWrapper=subsWrapper.default;
                        }
                        subsWrapper(plant, logger(plant.name, 'sub', subName));
                    });
                    console.log('done');
                    done();
                });

            }

        ], function loadDone(error) {
            if (error) throw error;
            plant.emit('ready');

            // splash screen
            const {name, version} = plant._packageInfo;
            console.log(` `);
            console.log(`************************************************************************`);
            console.log(`  🏭 ${plant.name} [${plant.id}] ready:`);
            console.log(`    > id: ${plant.id}`);
            console.log(`    > package: ${name}@${version}`);
            console.log(`    > environment: ${plant.config.environment}`);
            console.log(`    > subscribers: ${plant._subscribers.join(', ')} (total: ${plant._subscribers.length})`);
            console.log(`************************************************************************`);
            console.log(` `);

        });

    }

    ready() {
        return this.readyPromise;
    }

    configReady() {
        return this.configPromise;
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
