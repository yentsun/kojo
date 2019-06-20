module.exports = function () {

    const [kojo, logger] = this;
    logger.debug('expecting failure');
    throw new Error('Expected failure occurred');
};
