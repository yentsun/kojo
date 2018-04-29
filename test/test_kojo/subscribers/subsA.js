const assert = require('assert');
const sleep = require('util').promisify(setTimeout);


module.exports = async (kojo, logger) => {

    const {alpha, bravo} = kojo.modules;
    assert(alpha.methodA);
    assert(bravo.methodA);
    await sleep(15);
    logger.debug('called');
};
