module.exports = async function () {

    const {plant, logger} = this;

    const nats = plant.get('nats');
    logger.debug(`called`);
    return nats;
};
