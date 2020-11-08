import assert from 'assert';
import { promisify } from 'util';


const sleep = promisify(setTimeout);

export default async (kojo, logger) => {

    const {alpha, bravo} = kojo.methods;
    assert(alpha.methodA);
    assert(bravo.methodA);
    assert(typeof logger.debug === 'function');
    await sleep(5);
};
