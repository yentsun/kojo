module.exports = (plant, logger) => {

    return (args, done) => {
        const nats = plant.get('nats');
        logger.debug(`called`);
        done(null, nats);
    }
};
