const assert = require('assert');
const sleep = require('util').promisify(setTimeout);


module.exports = async (kojo, logger) => {

    const alpha = kojo.module('alpha');
    const bravo = kojo.module('bravo');
    assert(alpha.methodA);
    assert(bravo.methodA);
    await sleep(5);
    logger.debug('called');
};
