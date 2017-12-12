const winston = require('winston');
const moment = require('moment');

module.exports = function (instanceName, moduleName, methodName) {
    const formatter = (options) => {
        return `${options.timestamp()} ${instanceName} ${options.level.toUpperCase()} [${moduleName}.${methodName}] ${options.message || ''} ${options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''}`
    };

    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: process.env.LOG_LEVEL || 'info',
                timestamp: () => { return moment().toISOString() },
                formatter,
                stderrLevels: ['error']
            })
        ]
    })
};
