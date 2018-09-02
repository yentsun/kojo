module.exports = function () {

    const {logger} = this;
    logger.debug('expecting failure');
    throw new Error('Expected failure occurred');
};
