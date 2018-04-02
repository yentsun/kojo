module.exports = async function (arg) {

    const {plant, logger} = this;
    const variable = plant.get('variable');
    if (typeof logger.info !== 'function') throw new Error('Logger inaccessible');
    if(!arg) throw new Error('No arguments defined (error log test)');
    return arg * variable;
};