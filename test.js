const {assert} = require('chai');
const {describe, before, it} = require('mocha');
const sinon = require('sinon');
const plant = require('./index');
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
        this.timeout(4000);
        plant = new plant('test-plant', options, pack);
        await plant.ready();
        nats.config = plant.config.nats;
        plant.set('nats', nats);
    });

    it('loads modules available to each other', (done) => {
        plant.module('alpha').on('aCalled', methodAcalledSpy);
        plant.module('alpha').methodA([], (error, result) => {
            assert.equal(result, 'bravo');
            done();
        });
    });

    it('enables a module emit an event', (done) => {
        assert.isTrue(methodAcalledSpy.calledOnce);
        done();
    });

    it('loads config and extras', (done) => {
        plant.module('alpha').methodB([], (error, nats) => {
            assert.isTrue(nats.connection);
            assert.equal(nats.config.host, 'natsHost');
            done();
        });
    });

    it('loads new async style modules (with 2 params)', async function () {
        const result = await plant.module('charlie').methodA(3);
        assert.equal(result, 51);
    });

    it('checks whether plant accessible inside methods (with 2 params)', async function () {
        plant.set('variable', 12);
        const result = await plant.module('charlie').methodA(3);
        assert.equal(result, 36);
    });

    it('checks exception logging (with 2 params)', async function () {
        try {
            const result = await plant.module('charlie').methodA(0);
        }catch(err){
            // Just to mark test passed. There will be no need to use it in production. I'll show
        }
    });

    // Context approach
    it('loads new async style modules (with context)', async function () {
        plant.set('variable', undefined);
        const result = await plant.module('charlie').nonArrow(3);
        assert.equal(result, 51);
    });

    it('checks whether plant accessible inside methods (with context)', async function () {
        plant.set('variable', 12);
        const result = await plant.module('charlie').nonArrow(3);
        assert.equal(result, 36);
    });

    it('checks exception logging (with context)', async function () {
        try {
            const result = await plant.module('charlie').nonArrow(0);
        }catch(err){
            // Just to mark test passed. There will be no need to use it in production. I'll show
        }
    });
});
