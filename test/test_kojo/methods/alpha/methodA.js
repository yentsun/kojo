import assert from 'assert';


export default async function MethodA() {

    const [ kojo, logger ] = this;
    const { alpha, bravo } = kojo.methods;

    // some logger tests
    logger.setCustomTag('req-43');
    logger.debug();
    logger.debug('object test', {key: 'value', obj: {key: 'value'}});

    logger.debug('called');
    logger.warn('WARNING!');
    assert(typeof alpha.methodB === 'function');
    kojo.emit('aCalled', 'boo');
    return await bravo.methodA();
};
