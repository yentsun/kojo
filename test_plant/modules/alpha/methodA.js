const assert = require('assert');


module.exports = (plant, logger) => {

    return (args, done) => {
        const alpha = plant.module('alpha');
        const bravo = plant.module('bravo');
        logger.debug(`called`);
        assert(typeof alpha.methodB === 'function');
        alpha.emit('aCalled');
        bravo.methodA(null, done);
    }
};
