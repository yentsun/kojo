import assert from 'assert';
import sinon from 'sinon';
import Kojo from'../index.js';


describe('a regular kojo', () => {

    const methodAcalledSpy = sinon.spy();
    const options = {
        subsDir: './test/test_kojo/endpoints',
        serviceDir: './test/test_kojo/methods',
        name: 'regular',
        icon: '🚩',
        logLevel: 'debug',
        loggerIdSuffix: true
    };
    let kojo;

    before(async function() {
        kojo = new Kojo(options);
        kojo.set('nats', { host: 'natsHost', connection: true });
        kojo.set('rub', '튎嵸覆');
        await kojo.ready();
    });

    it('loads services available to each other', async () => {
        kojo.on('aCalled', methodAcalledSpy);
        const result = await kojo.methods.alpha.methodA([]);
        assert.strictEqual(result, 'bravo');
    });

    it('allows a service to emit events', (done) => {
        assert(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', async () => {
        const nats = await kojo.methods.alpha.methodB();
        assert(nats.connection);
        assert.strictEqual(nats.host, 'natsHost');
    });

    it('allows multiple extras unpacking', async () => {
        const {nats, rub} = await kojo.state;
        assert(nats.connection);
        assert.strictEqual(nats.host, 'natsHost');
        assert.strictEqual(nats.host, kojo.get().nats.host);
        assert.strictEqual(rub, '튎嵸覆');
    });

    it('checks whether kojo accessible inside methods (with 2 params)', async () => {
        kojo.set('variable', 12);
        const result = await kojo.methods.charlie.methodA(3);
        assert.strictEqual(result, 36);
    });

    it('has promise rejected if module throws', async () => {
        try {
            await kojo.methods.alpha.methodZ();
        } catch (error) {
            assert.strictEqual(error.message, 'Synthetic method error');
        }
    });

    it('checks exception logging (with 2 params)', async () => {
        try {
            await kojo.methods.charlie.methodA();
        } catch (error) {
            // Just to mark test passed. You should see the error logged
        }
    });

    it('allows a method to be a sync function', (done) => {
        assert.strictEqual(kojo.methods.bravo.syncMethod('Im ', 'sync'), 'Im sync');
        done();
    });

    it('handles errors from sync method', (done) => {
        try {
            kojo.methods.bravo.syncFailingMethod();
        } catch (error) {
            assert.strictEqual(error.message, 'Expected failure occurred');
            done();
        }
    })

});

describe('broken endpoints kojo', () => {

    const options = {
        name: 'broken',
        subsDir: './test/broken_endpoints_kojo/endpoints',
        serviceDir: './test/broken_endpoints_kojo/services'
    };

    it('throws on non-existent subscribers directory', async () => {
        const kojo = new Kojo(options);
        try {
            const res = await kojo.ready();
            assert(! res, 'Expected errors, but got none');
        } catch (error) {
            assert(error.message.includes('ENOENT: no such file or directory, scandir'));
            assert(error.message.includes('broken_endpoints_kojo'));
            assert(error.message.includes('endpoints'));
        }
    })

});

describe('broken services kojo', () => {

    const options = {
        name: 'broken',
        subsDir: './test/broken_kojo/subscribers',
        serviceDir: './test/broken_kojo/services'
    };

    it('throws on non-existent service directory', async () => {
        const kojo = new Kojo(options);
        try {
            const res = await kojo.ready();
            assert(!res, 'Expected errors, but got none');
        } catch (error) {
            assert(error.message.includes('ENOENT: no such file or directory, scandir '));
        }
    })

});

describe('nameless kojo', () => {

    const options = {
        subsDir: './test/test_kojo/endpoints',
        serviceDir: './test/test_kojo/services'
    };

    it('is assigned a default name', async () => {
        const kojo = new Kojo(options);
        await kojo.ready();
        assert(kojo.name === '工場');
    })

});

describe('service-less kojo', () => {

    const options = {
        name: 'no-serv',
        serviceDir: './test/service-less/subs'
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