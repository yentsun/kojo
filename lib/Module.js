const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const forEach = require('lodash').forEach;
const bluebird = require('bluebird');
const logger = require('./logger');


const wrapFunc = (fn, plant, logger) => {
    if (Object.getPrototypeOf(fn).constructor.name !== 'AsyncFunction') throw new Error('plant.Module.Wrapper: Should be used on async functions');
    return async (...params) => {
        return Promise.resolve(fn(plant, logger, ...params))
            .catch(err => {
                logger.error(err.message);
                throw err;
            });
    }
};

const wrapNonArrowFunc = (fn, plant, logger) => {
    if (Object.getPrototypeOf(fn).constructor.name !== 'AsyncFunction') throw new Error('plant.Module.Wrapper: Should be used on async functions');
    return async (...params) => {
        const context={plant, logger};
        return Promise.resolve(fn.call(context, ...params))
            .catch(err => {
                logger.error(err.message);
                throw err;
            });
    }
};

module.exports = class extends EventEmitter {

    constructor (moduleName, modulePath, plant) {
        super();
        const module = this;
        const methodFiles = fs.readdirSync(modulePath);
        forEach(methodFiles, (methodFilename) => {
            const methodName = path.basename(methodFilename, '.js');
            if (methodName === 'test') return;
            const requirePath = path.join(modulePath, methodFilename);
            if (fs.lstatSync(requirePath).isDirectory()) return;

            let wrapper = require(requirePath);
            if(Object.getPrototypeOf(wrapper).constructor.name !== 'AsyncFunction'){
                // old style definition
                if(typeof wrapper === 'object'){
                    // for ES6 exports
                    wrapper=wrapper.default;
                }
                const handler = wrapper(plant, logger(plant.name, moduleName, methodName));
                module[methodName] = function (...params) {
                    const result = handler(...params);
                    if (result && !!result.then && typeof result.then === 'function') {
                        bluebird.resolve(result).asCallback(params[params.length - 1])
                    }
                }
            }else if(methodName === 'nonArrow'){
                // just a demo to show you possibilities
                // new style definition with async functions and CONTEXT
                const log = logger(plant.name, moduleName, methodName);
                module[methodName] = wrapNonArrowFunc(wrapper, plant, log);
            }else{
                // new style definition with async functions and PARAMETERS
                const log = logger(plant.name, moduleName, methodName);
                module[methodName] = wrapFunc(wrapper, plant, log);
            }
        });

    }
};
