const assert = require('assert');
const sinon = require('sinon');
const Kojo = require('../index');


describe('kojo', () => {

    const methodAcalledSpy = sinon.spy();
    const options = {
        subsDir: './test/test_kojo/subscribers',
        serviceDir: './test/test_kojo/services',
        name: 'test',
        icon: '🚩',
        logLevel: 'debug',
        loggerIdSuffix: true
    };
    let kojo;

    before(async function() {
        kojo = new Kojo(options);
        kojo.set('nats', {host: 'natsHost', connection: true});
        kojo.set('rub', '튎嵸覆');
        await kojo.ready();
    });

    it('loads services available to each other', async () => {
        kojo.on('aCalled', methodAcalledSpy);
        const result = await kojo.services.alpha.methodA([]);
        assert.equal(result, 'bravo');
    });

    it('lets services to emit events', (done) => {
        assert(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', async () => {
        const nats = await kojo.services.alpha.methodB();
        assert(nats.connection);
        assert.equal(nats.host, 'natsHost');
    });

    it('allows multiple extras unpacking', async () => {
        const {nats, rub} = await kojo.state;
        assert(nats.connection);
        assert.equal(nats.host, 'natsHost');
        assert.equal(rub, '튎嵸覆');
    });

    it('checks whether kojo accessible inside methods (with 2 params)', async () => {
        kojo.set('variable', 12);
        const result = await kojo.services.charlie.methodA(3);
        assert.equal(result, 36);
    });

    it('has promise rejected if module throws', async () => {
        try {
            await kojo.services.alpha.methodZ();
        } catch (error) {
            assert.equal(error.message, 'Synthetic method error');
        }
    });

    it('checks exception logging (with 2 params)', async () => {
        try {
            await kojo.module('charlie').methodA();
        } catch (error) {
            // Just to mark test passed. You should see the error logged
        }
    });

    it('allows a method to be a sync function', (done) => {
        assert.equal(kojo.services.bravo.syncMethod('Im ', 'sync'), 'Im sync');
        done();
    });

    it('handles errors from sync method', (done) => {
        try {
            kojo.services.bravo.syncFailingMethod();
        } catch (error) {
            assert.equal(error.message, 'Expected failure occurred');
            done();
        }
    })

});

describe('broken kojo', () => {

    const options = {
        name: 'broken',
        subsDir: './test/broken_kojo/subscribers',
        modulesDir: './test/broken_kojo/services'
    };

    it('throws on broken module', async () => {
        const kojo = new Kojo(options);
        try {
            await kojo.ready();
        } catch (error) {
            assert.equal(error.message, 'Method zulu.methodA is not an async function');
        }
    })

});

describe('nameless kojo', () => {

    const options = {
        subsDir: './test/test_kojo/subscribers',
        serviceDir: './test/test_kojo/services'
    };

    it('is assigned a default name', async () => {
        const kojo = new Kojo(options);
        await kojo.ready();
        assert(kojo.name === '工場');
    })

});

describe('module-less kojo', () => {

    const options = {
        name: 'no-mod',
        subsDir: './test/module-less/subs'
    };

    it('initializes normally', async () => {
        const kojo = new Kojo(options);
        await kojo.ready();
    })

});

describe('empty kojo', () => {

    it('initializes normally', async () => {
        const kojo = new Kojo({name: 'empty'});
        await kojo.ready();
    })

});