const assert = require('assert');


module.exports = async function () {

    const {plant, logger} = this;

    const alpha = plant.module('alpha');
    const bravo = plant.module('bravo');
    logger.debug(`called`);
    assert(typeof alpha.methodB === 'function');
    alpha.emit('aCalled');
    return await bravo.methodA();
};
