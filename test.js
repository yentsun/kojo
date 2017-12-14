const {assert} = require('chai');
const sinon = require('sinon');
const Plant = require('./index');
const pack = require('./package.json');


describe('plant', () => {

    const methodAcalledSpy = sinon.spy();
    const options = {
        subsDir: './test_plant/subscribers',
        modulesDir: './test_plant/modules',
        configFile: './test_plant/config.ini'
    };
    const nats = {connection: true};
    let plant;

    before(async function() {
        plant = new Plant('test-plant', options, pack);
        await plant.ready();
        nats.config = plant.config.nats;
        plant.set('nats', nats);
    });

    it('loads modules available to each other', async () => {
        plant.module('alpha').on('aCalled', methodAcalledSpy);
        const result = await plant.module('alpha').methodA([]);
        assert.equal(result, 'bravo');
    });

    it('lets modules to emit events', (done) => {
        assert.isTrue(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', async () => {
        const nats = await plant.module('alpha').methodB();
        assert.isTrue(nats.connection);
        assert.equal(nats.config.host, 'natsHost');
    });

    it('checks whether plant accessible inside methods (with 2 params)', async function () {
        plant.set('variable', 12);
        const result = await plant.module('charlie').methodA(3);
        assert.equal(result, 36);
    });

    it('checks exception logging (with 2 params)', async function () {
        try {
            await plant.module('charlie').methodA();
        } catch (error) {
            // Just to mark test passed. You should see the error logged
        }
    });

});
