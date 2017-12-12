module.exports = (plant, logger) => {

    return (args, done) => {
        logger.debug(`called`);
        done(null, 'bravo');
    }
};
