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

    constructor(serviceName, servicePath, kojo) {

        super();

        // METHODS

        const methodFiles = fs.readdirSync(servicePath);
        methodFiles.forEach((methodFilename) => {

            const methodName = path.basename(methodFilename, '.js');

            // reserved for unit tests
            if (methodName === 'test') return;

            const requirePath = path.join(servicePath, methodFilename);

            if (fs.lstatSync(requirePath).isDirectory()) return;

            let wrapper = require(requirePath);
            const logger = new Logger({kojo, serviceName, methodName, color: 'yellow'});
            const fnType = Object.getPrototypeOf(wrapper).constructor.name;

            if (fnType === 'AsyncFunction')
                this[methodName] = _wrapAsync(wrapper, kojo, logger);

            if (fnType === 'Function')
                this[methodName] = _wrapSync(wrapper, kojo, logger);
        });

    }
};
