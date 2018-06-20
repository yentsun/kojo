const assert = require('assert');
const sleep = require('util').promisify(setTimeout);


module.exports = async (kojo, logger) => {

    const {alpha, bravo} = kojo.modules;
    assert(alpha.methodA);
    assert(bravo.methodA);
    assert(typeof logger.debug === 'function');
    await sleep(15);
    alpha.on('aCalled', (param) => {
        assert(param === 'boo' );
        logger.info('got alpha.aCalled with', param);
        logger.debug('ending subscriber');
    });
};
