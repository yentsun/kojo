const assert = require('assert');
const sinon = require('sinon');
const Kojo = require('../index');
const pack = require('../package.json');


describe('kojo', () => {

    const methodAcalledSpy = sinon.spy();
    const options = {
        subsDir: './test/test_kojo/subscribers',
        modulesDir: './test/test_kojo/modules',
        nats: {host: 'natsHost'}, // TODO move to global config
        icon: '🚩'
    };
    const nats = {connection: true};
    let kojo;

    before(async function() {
        kojo = new Kojo('test-kojo', options, pack);
        await kojo.ready();
        nats.config = kojo.config.nats;
        kojo.set('nats', nats);
        kojo.set('rub', '튎嵸覆');
    });

    it('loads modules available to each other', async () => {
        kojo.module('alpha').on('aCalled', methodAcalledSpy);
        const result = await kojo.module('alpha').methodA([]);
        assert.equal(result, 'bravo');
    });

    it('lets modules to emit events', (done) => {
        assert(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', async () => {
        const nats = await kojo.module('alpha').methodB();
        assert(nats.connection);
        assert.equal(nats.config.host, 'natsHost');
    });

    it('allows multiple extras unpacking', async () => {
        const {nats, rub} = await kojo.get();
        assert(nats.connection);
        assert.equal(nats.config.host, 'natsHost');
        assert.equal(rub, '튎嵸覆');
    });

    it('checks whether kojo accessible inside methods (with 2 params)', async function () {
        kojo.set('variable', 12);
        const result = await kojo.module('charlie').methodA(3);
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
        subsDir: './test/broken_kojo/subscribers',
        modulesDir: './test/broken_kojo/modules'
    };

    it('throws on broken module', async () => {
        const kojo = new Kojo('broken-kojo', options, pack);
        try {
            await kojo.ready();
        } catch (error) {
            assert(error.message === 'Method zulu.methodA is not an async function');
        }
    })

});
