const pino = require('pino');


module.exports = function (kojo, moduleName, methodName) {

    const formatter = ({level}, options) => {
        return `${kojo.id} ${level} [${moduleName}.${methodName}] ${options.message} ${options.meta && Object.keys(options.meta).length ? '<'+JSON.stringify(options.meta)+'>' : ''}`
    };

    const formatted = pino.pretty({
        // forceColor: true
    });
    const base = pino({
        level: process.env.LOG_LEVEL || 'debug'
    });
    const moduleLogger = base.child({moduleName});
    return moduleLogger.child({methodName});
};
