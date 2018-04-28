const fs = require('fs');
const path = require('path');
const {EventEmitter} = require('events');
const Logger = require('./logger');


const wrapMethod = (fn, kojo, logger) => {

    return async (...params) => {

        const context = {kojo, logger};
        return Promise
            .resolve(fn.call(context, ...params))
            .catch(error => {
                logger.error(error.message);
                throw error;
            });
    }
};

module.exports = class extends EventEmitter {

    constructor(moduleName, modulePath, kojo) {

        super();

        // METHODS

        const methodFiles = fs.readdirSync(modulePath);
        methodFiles.forEach((methodFilename) => {
            const methodName = path.basename(methodFilename, '.js');
            if (methodName === 'test') return;
            const requirePath = path.join(modulePath, methodFilename);
            if (fs.lstatSync(requirePath).isDirectory()) return;
            let wrapper = require(requirePath);
            const logger = Logger(kojo, moduleName, methodName);
            if (Object.getPrototypeOf(wrapper).constructor.name !== 'AsyncFunction')
                throw new Error(`Method ${moduleName}.${methodName} is not an async function`);
            this[methodName] = wrapMethod(wrapper, kojo, logger);
        });

    }
};
