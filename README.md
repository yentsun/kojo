Plant
=====

A Node.js event-driven microservice framework
 

Installation
------------

```
 npm i yt-plant
```


Usage
-----
 
Create a plant:
 
 ```js
const Plant = require('yt-plant');
const pg = require('pg'); 
const pack = require('./package.json');

async function main() {
    const plant = new Plant('plantName', options, pack);
    await plant.ready();
    const {username, password, host, name} = config.pg;
    const pool = new pg.Pool({
        user: username,
        database: name,
        password,
        host
    });
    plant.set('pg', pool);
}

return main();

```

Create a module's method (`modules/<moduleName>/<methodName>.js`):

 ```js
module.exports = async function (someData) {
    
    const {plant, logger} = this;  // plant instance and the logger
    logger.debug('creating new record', someData);
    const someModule = plant.module('someModule'); // load other module
    const pool = plant.get('pg');  // get pg instance from plant
    const query = `INSERT INTO ... RETURNING *`;
    const result = await pool.query(query);
    const newRecord = result ? result.rows[0] : null;
    if (newRecord) {
        logger.info('new record created', newRecord);
        someModule.emit('created', newRecord)
    }
    return newRecord;
}
```

Create a subscriber (`subscribers/someEntity.created.js`):

 ```js
module.exports = (plant, logger) => {

    const someModule = plant.module('someModule');
    const someOtherModule = plant.module('someOtherModule');
    const nats = plant.get('nats');

    someModule.on('created', async (newRecord) => {
        const {id, ...} = newRecord;
        const data = await nats.request('some.subject', {...});
        const result = await someOtherModule.method(data);
        logger.debug('some log entry...');
        const updatedRecord = await someModule.update(id, result);
        if (updatedRecord) nats.publish('record.created', updatedRecord);
    });
}
```


Test
----

```
npm test
```