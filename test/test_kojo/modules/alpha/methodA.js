const assert = require('assert');


module.exports = async function () {

    const {kojo, logger} = this;
    const {alpha, bravo} = kojo.modules;

    // some logger tests
    logger.debug();
    logger.debug('object test', {key: 'value', obj: {key: 'value'}});

    logger.debug(`called`);
    assert(typeof alpha.methodB === 'function');
    alpha.emit('aCalled');
    return await bravo.methodA();
};
