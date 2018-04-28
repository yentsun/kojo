module.exports = async function () {

    const {kojo, logger} = this;

    const nats = kojo.get('nats');
    logger.debug(`called`);
    return nats;
};
