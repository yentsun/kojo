module.exports = function (argumentA, argumentB) {

    const [kojo, logger] = this;
    logger.debug('called');
    return argumentA + argumentB;
};
