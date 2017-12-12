Venture API Plant
=================

An event-driven microservice framework powering up Venture API system.
 

Installation
------------

```
 npm install venture-api/plant#v2.2.2
```


Usage
-----
 
Create a plant:
 
 ```node.es6
 const Plant = require('venture-plant');
 
 const plant = new Plant('plantName', options);
 
 plant.on('config', (config, done) => {
     // when plant receives config - bootstrap pg pool (and other stuff)
     const {username, password, host, name} = config.pg;
     const pool = new pg.Pool({
         user: username,
         database: name,
         password,
         host
     });
     plant.set('pg', pg);
     done();  // <-- important
 });
 
```

Create a module's method (`modules/module/method.js`):

 ```node.es6
module.exports = (plant, logger) => {

    return (someData, done) => {
        logger.debug('creating new record', someData);
        const someModule = plant.module('someModule');
        const pool = plant.get('pg');
        const query = `INSERT INTO ... RETURNING *`;
        pool.query(query, values, (error, result) => {
            if (error) {
                logger.error(error.message);
                return done(error);
            }
            const newRecord = result ? result.rows[0] : null;
            if (newRecord) {
                logger.info('new record created', newRecord);
                someModule.emit('created', newRecord)
            }
            done(null, newRecord);
        });
    }
}
```

Create a subscriber (`subscribers/someEntity.created.js`):

 ```node.es6
module.exports = (plant, logger) => {

    const someModule = plant.module('someModule');
    const someOtherModule = plant.module('someOtherModule');
    const nats = plant.get('nats');

    someModule.on('created', (newRecord) => {
        const {id, ...} = newRecord;

        waterfall([

            (actionOneDone) => {
                nats.request('some.subject', {...}, actionOneDone);
            },

            (data, actionTwoDone) => {
                someOtherModule.method(data, actionTwoDone);
            },

            (result, actionThreeDone) => {
                logger.debug('some log entry...');
                someModule.update(id, result, actionThreeDone);
            }

        ], (error, updatedRecord) => {
            if (updatedRecord) nats.publish('record.created', updatedRecord);
        });

    });
}
```


Test
----

```shell
npm test
```