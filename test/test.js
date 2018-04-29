const assert = require('assert');
const sinon = require('sinon');
const Kojo = require('../index');


describe('kojo', () => {

    const methodAcalledSpy = sinon.spy();
    const options = {
        subsDir: './test/test_kojo/subscribers',
        modulesDir: './test/test_kojo/modules',
        name: 'test',
        icon: '🚩'
    };
    let kojo;

    before(async function() {
        kojo = new Kojo(options);
        await kojo.ready();
        kojo.set('nats', {host: 'natsHost', connection: true});
        kojo.set('rub', '튎嵸覆');
    });

    it('loads modules available to each other', async () => {
        kojo.modules.alpha.on('aCalled', methodAcalledSpy);
        const result = await kojo.modules.alpha.methodA([]);
        assert.equal(result, 'bravo');
    });

    it('lets modules to emit events', (done) => {
        assert(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', async () => {
        const nats = await kojo.modules.alpha.methodB();
        assert(nats.connection);
        assert.equal(nats.host, 'natsHost');
    });

    it('allows multiple extras unpacking', async () => {
        const {nats, rub} = await kojo.get();
        assert(nats.connection);
        assert.equal(nats.host, 'natsHost');
        assert.equal(rub, '튎嵸覆');
    });

    it('checks whether kojo accessible inside methods (with 2 params)', async function () {
        kojo.set('variable', 12);
        const result = await kojo.modules.charlie.methodA(3);
        assert.equal(result, 36);
    });

    it('checks exception logging (with 2 params)', async function () {
        try {
            await kojo.module('charlie').methodA();
        } catch (error) {
            // Just to mark test passed. You should see the error logged
        }
    });

});

describe('broken kojo', () => {

    const options = {
        name: 'broken',
        subsDir: './test/broken_kojo/subscribers',
        modulesDir: './test/broken_kojo/modules'
    };

    it('throws on broken module', async () => {
        const kojo = new Kojo(options);
        try {
            await kojo.ready();
        } catch (error) {
            assert(error.message === 'Method zulu.methodA is not an async function');
        }
    })

});

describe('nameless kojo', () => {

    const options = {
        subsDir: './test/test_kojo/subscribers',
        modulesDir: './test/test_kojo/modules'
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