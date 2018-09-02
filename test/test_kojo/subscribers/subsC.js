const assert = require('assert');
const sleep = require('util').promisify(setTimeout);


module.exports = async (kojo, logger) => {

    const {alpha, bravo} = kojo.services;
    assert(alpha.methodA);
    assert(bravo.methodA);
    assert(typeof logger.debug === 'function');
    await sleep(5);
};
