/**
 * @module logger
 */
const chalk = require('chalk');


const levels = {
    debug: 'debug',
    error: 'error',
    info: 'info'
};

const colors = {
    debug: chalk.cyan,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
};

/**
 * Kojo logger class
 *
 * @class
 * @private
 * @alias module:logger
 * @example
 * ```js
 * const logger = new Logger(kojo, null, subName, 'bold')
 * ```
 */
module.exports = class {

    /**
     * Create Logger instance
     *
     * @param {object} options - configuration options
     * @param {object} options.kojo - Kojo instance
     * @param {string} options.serviceName - name of the service this logger is created for
     * @param {string} options.methodName - name of the service method this logger is created for
     * @param {string} options.color - special `chalk` color to use for this service method (default: white)
     */
    constructor({kojo, serviceName, methodName, color='white'}) {

        const {id, name, config} = kojo;
        this.id = id;
        this.color = color;
        this.icon = config.icon;
        this.prefix = config.loggerIdPrefix;
        this.serviceName = serviceName;
        this.methodName = methodName;
        this.name = name;
        this.level = config.logLevel || levels.debug;
        this.silent = this.level === 'silent';
    }

    /**
     * Render log entry by writing it to a std stream
     *
     * @private
     * @param {string} level - entry's log level
     * @param {array} args - array of entry's arguments
     * @param {string} out - std stream name, default: 'stdout'
     * @returns {undefined}
     */
    _render(level, args, out='stdout') {
        const pieces = [this.methodName];
        if (this.serviceName)
            pieces.unshift(this.serviceName);
        const serviceMethod = pieces.join('.');
        process[out].write(`${chalk.gray(`${this.icon} ${this.prefix ? this.id : this.name }`)} ${colors[level](level.toUpperCase())} ${chalk[this.color](`[${serviceMethod}]`)} `);
        process[out].write(args.join(' ')+'\n');
    }

    /**
     * Write a debug entry
     *
     * @param {...string} args - arguments to output with the entry's message
     * @returns {undefined}
     */
    debug(...args) {
        if ([levels.debug].includes(this.level) && !this.silent) {
            this._render(levels.debug, args);
        }
    }

    /**
     * Write an error entry. Will be rendered to 'stderr'
     *
     * @param {...string} args - arguments to output with the entry's message
     * @returns {undefined}
     */
    error(...args) {
        if ([levels.debug, levels.error].includes(this.level) && !this.silent) {
            this._render(levels.error, args, 'stderr');
        }
    }

    /**
     * Write an info entry
     *
     * @param {...string} args - arguments to output with the entry's message
     * @returns {undefined}
     */
    info(...args) {
        if ([levels.info, levels.debug, levels.error].includes(this.level) && !this.silent) {
            this._render(levels.info, args);
        }
    }
};
