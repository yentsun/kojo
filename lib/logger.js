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

    loglevel.setLevel(kojo.config.loglevel);

    prefix.apply(loglevel, {
        format(level, name, timestamp) {
            return `${chalk.gray(`${kojo.config.icon} ${kojo.id}`)} ${colors[level.toUpperCase()](level)} ${chalk[color](`[${moduleName}${methodName}]`)}`;
        }
    });

    return loglevel;
};
