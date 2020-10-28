import assert from 'assert';


export default async function MethodA() {

    const [ kojo, logger ] = this;
    const { alpha, bravo } = kojo.services;

    // some logger tests
    logger.debug();
    logger.debug('object test', {key: 'value', obj: {key: 'value'}});

    logger.debug('called');
    logger.warn('WARNING!');
    assert(typeof alpha.methodB === 'function');
    kojo.emit('aCalled', 'boo');
    return await bravo.methodA();
};
