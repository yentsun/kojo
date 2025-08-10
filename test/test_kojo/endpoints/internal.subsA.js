import assert from 'assert';
import { promisify } from 'util';


const sleep = promisify(setTimeout);

export default async (kojo, logger) => {

    const { alpha, bravo } = kojo.methods;
    assert(alpha.methodA);
    assert(bravo.methodA);
    assert(typeof logger.debug === 'function');
    await sleep(15);
    kojo.on('aCalled', (param) => {
        assert(param === 'boo' );
        logger.addTag('req-1');
        logger.info('got alpha.aCalled with', param);
        logger.debug('ending subscriber');
    });
};
