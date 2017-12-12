const assert = require('assert');


module.exports = (plant, logger) => {

    const alpha = plant.module('alpha');
    const bravo = plant.module('bravo');
    assert(alpha.methodA);
    assert(bravo.methodA);
    logger.debug('called');
};
