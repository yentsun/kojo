const fs = require('fs');
const path = require('path');
const {EventEmitter} = require('events');
const Logger = require('./logger');


const _wrapAsync = (fn, kojo, logger) => {

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

const _wrapSync = (fn, kojo, logger) => {

    return (...params) => {

        const context = {kojo, logger};
        try {
            return fn.call(context, ...params)
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }
};

module.exports = class extends EventEmitter {

    constructor(moduleName, modulePath, kojo) {

        super();

        // METHODS

        const methodFiles = fs.readdirSync(modulePath);
        methodFiles.forEach((methodFilename) => {

            const methodName = path.basename(methodFilename, '.js');

            // reserved for unit tests
            if (methodName === 'test') return;

            const requirePath = path.join(modulePath, methodFilename);

            if (fs.lstatSync(requirePath).isDirectory()) return;

            let wrapper = require(requirePath);
            const logger = Logger(kojo, moduleName+'.', methodName, 'yellow').getLogger(moduleName+'.'+methodName);
            const fnType = Object.getPrototypeOf(wrapper).constructor.name;

            if (fnType === 'AsyncFunction')
                this[methodName] = _wrapAsync(wrapper, kojo, logger);

            if (fnType === 'Function')
                this[methodName] = _wrapSync(wrapper, kojo, logger);
        });

    }
};
