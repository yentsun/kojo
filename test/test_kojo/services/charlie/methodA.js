module.exports = async function (arg) {

    const [kojo, logger] = this;
    const variable = kojo.get('variable');

    if (typeof logger.info !== 'function')
        throw new Error('Logger inaccessible');

    if(!arg)
        throw new Error('No arguments defined (error log test)');

    return arg * variable;
};