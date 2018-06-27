const loglevel = require('loglevel');
const chalk = require('chalk');
const prefix = require('loglevel-plugin-prefix');

const colors = {
    TRACE: chalk.magenta,
    DEBUG: chalk.cyan,
    INFO: chalk.blue,
    WARN: chalk.yellow,
    ERROR: chalk.red,
};

prefix.reg(loglevel);
loglevel.enableAll();

module.exports = function (kojo, moduleName, methodName, color) {

    const {id, config} = kojo;
    loglevel.setLevel(config.loglevel);

    prefix.apply(loglevel, {
        format(level, name, timestamp) {
            return `${chalk.gray(`${config.icon} ${config.loggerIdPrefix ? id : kojo.name }`)} ${colors[level.toUpperCase()](level)} ${chalk[color](`[${name}]`)}`;
        }
    });

    return loglevel;
};
