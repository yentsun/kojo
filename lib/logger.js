const winston = require('winston');


module.exports = function (kojo, moduleName, methodName) {

    const formatter = (options) => {
        return `${options.timestamp()} ${kojo.id} ${options.level.toUpperCase()} [${moduleName}.${methodName}] ${options.message || ''} ${options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''}`
    };

    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: process.env.LOG_LEVEL || 'info',
                timestamp: function () {
                    const now = new Date();
                    return now.toISOString()
                },
                formatter,
                stderrLevels: ['error']
            })
        ]
    })
};
