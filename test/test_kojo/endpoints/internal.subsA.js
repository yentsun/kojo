import assert from 'assert';
import { promisify } from 'util';


const sleep = promisify(setTimeout);

export default async (kojo, logger) => {

    const { alpha, bravo } = kojo.services;
    assert(alpha.methodA);
    assert(bravo.methodA);
    assert(typeof logger.debug === 'function');
    await sleep(15);
    kojo.on('aCalled', (param) => {
        assert(param === 'boo' );
        logger.info('got alpha.aCalled with', param);
        logger.debug('ending subscriber');
    });
};
