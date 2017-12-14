const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const forEach = require('lodash').forEach;
const logger = require('./logger');


const wrapMethod = (fn, plant, logger) => {
    return async (...params) => {
        const context = {plant, logger};
        return Promise.resolve(fn.call(context, ...params))
            .catch(error => {
                logger.error(error.message);
                throw error;
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
            const log = logger(plant.name, moduleName, methodName);
            if (Object.getPrototypeOf(wrapper).constructor.name !== 'AsyncFunction')
                throw new Error(`Method ${moduleName}.${methodName} is not an async function`);
            module[methodName] = wrapMethod(wrapper, plant, log);
        });

    }
};
