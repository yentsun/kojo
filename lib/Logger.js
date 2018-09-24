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
 * const logger = new Logger({icon, id, level, tagSeparator, tagPieces: [service, method], color: 'bold'})
 * ```
 */
module.exports = class {

    /**
     * Create Logger instance
     *
     * @param {object} options - configuration options
     * @param {String} options.id - server instance id
     * @param {object} options.icon - logger icon
     * @param {object} options.level - logger level
     * @param {String} options.tagSeparator - character to joint tagPieces with
     * @param {Array} options.tagPieces - array of values to form the tag from
     * @param {string} options.color - special `chalk` color to use for this service method (default: white)
     */
    constructor({icon, id, level, tagSeparator='.', tagPieces=[], color='white'}) {

        this.id = id;
        this.color = color;
        this.icon = icon;
        this.level = level || levels.debug;
        this.silent = this.level === 'silent';
        this.tagPieces = tagPieces;
        this.tagSeparator = tagSeparator;
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
        const tag = this.tagPieces.join(this.tagSeparator);
        process[out].write(`${chalk.gray(`${this.icon} ${this.id}`)} ${colors[level](level.toUpperCase())} ${chalk[this.color](`[${tag}]`)} `);
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
