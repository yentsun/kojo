🏭 Kojo
=======

An event-driven microservice framework. Kōjō (工場) means 'factory' in
Japanese.

[![Build Status](https://travis-ci.org/yentsun/kojo.svg?branch=master)](https://travis-ci.org/yentsun/kojo)
[![Coverage Status](https://coveralls.io/repos/github/yentsun/kojo/badge.svg?branch=master)](https://coveralls.io/github/yentsun/kojo?branch=master)


Installation
------------

```
 npm i kojo
```


Usage
-----
 
Create a kojo:
 
 ```js
const Kojo = require('kojo');
const pg = require('pg'); 
const pack = require('./package.json');


async function main() {
    
    const kojo = new Kojo('cars', options, pack);
    await kojo.ready();
    const pool = new pg.Pool({
        user: username,
        database: name,
        password,
        host
    });
    kojo.set('pg', pool);
}

return main();

```

Create a module's method (`modules/<moduleName>/<methodName>.js`):

 ```js
module.exports = async function (someData) {
    
    const {kojo, logger} = this;  // kojo instance and the logger
    logger.debug('creating new record', someData);
    const someModule = kojo.module('someModule'); // load other module
    const pool = kojo.get('pg');  // get pg instance from kojo
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
module.exports = (kojo, logger) => {

    const someModule = kojo.module('someModule');
    const someOtherModule = kojo.module('someOtherModule');
    const tasu = kojo.get('tasu');

    someModule.on('created', async (newRecord) => {
        const {id, ...} = newRecord;
        const data = await tasu.request('some.subject', {...});
        const result = await someOtherModule.method(data);
        logger.debug('some log entry...');
        const updatedRecord = await someModule.update(id, result);
        if (updatedRecord) tasu.publish('record.created', updatedRecord);
    });
}
```


Test
----

```
npm test
```