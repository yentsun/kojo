🏭 Kojo
=======

An event-driven microservice framework. Kōjō (工場) means 'factory' in
Japanese.

The idea of this framework emerged after couple of years of using
[Seneca], which in turn is a great tool for microservices but is probably
too abstract and complex.

Kojo, on the other hand, is very simple: it has subscribers, modules and
methods which are just plain functions. Subscribers susbscribe to a
pub/sub (or request/response) transport of your choice, modules perform
common tasks with methods.

[![Build Status](https://travis-ci.org/yentsun/kojo.svg?branch=master)](https://travis-ci.org/yentsun/kojo)
[![Coverage Status](https://coveralls.io/repos/github/yentsun/kojo/badge.svg?branch=master)](https://coveralls.io/github/yentsun/kojo?branch=master)
![Dependencies](https://david-dm.org/yentsun/kojo.svg)


Installation
------------

```
 npm i kojo
```


Usage
-----
 
Create a module with a method (`modules/user/create.js`):

 ```js
module.exports = async function (userData) {
    
    const {kojo, logger} = this;  // kojo instance and the logger

    logger.debug('creating', userData);  // logger will automatically add module and method name
    const pool = kojo.get('pg');  // get pg previously set pg connection
    const query = `INSERT INTO ... RETURNING *`;
    const result = await pool.query(query);
    const newRecord = result ? result.rows[0] : null;
    if (newRecord)
        logger.info('created', newRecord);
    return newRecord;
}
```


Create a subscriber (`subscribers/user.create.js`):

 ```js
module.exports = (kojo, logger) => {

    const {user} = kojo.modules;  // we defined `user` module above
    const nats = kojo.get('nats'); // as with pg connection above we have nats connection too

    nats.subscribe('user.create', async (userData) => {
        const newUser = await user.create(userData);
        if (newUser) nats.publish('user.created', newUser);
    });
}
```


Add connections, initialize kojo:

 ```js
 ...
const Kojo = require('kojo');


async function main() {

    const kojo = new Kojo({name: 'users'});

    const pool = new pg.Pool({
       user: 'pg_user',
       database: 'db_name',
       password: 'password',
       host: 'localhost'
    });
    kojo.set('pg', pool);  // can be used as `kojo.get('pg')`

    const nats = new NATS({...});
    kojo.set('nats', nats);

    await kojo.ready();
}

return main();

```


Configuration
-------------

The following options are available while creating a new Kojo instance:

- **name** - kojo name, useful for identification and will apear in
  logs (default `工場`)
- **icon** - another means if distinguishing your microservices
  (default `☢`)
- **subsDir** - subscribers directory (default `subscribers`)
- **modules** - modules directory (default `modules`)
- **parentPackage** - package.json of the parent package (default is the
  one in `process.cwd()` directory)


Instance API
------------

A Kojo instance has the following attributes:

- **name** - instance name, taken from configuration
- **id** - unique id if the instance, prefixed with `name` (example:
  `user.Ksk7p`)
- **config** - configuration object, default options merged with custom
  ones (see [Configuration](#configuration))
- **modules** - object, containg modules found in the modules directory;
  if a module has methods, they will be available through dot notation.
  Examples: `kojo.modules.user.create()`, `kojo.modules.profile.update()`
- **ready()** - returns a Promise which resolves after every module and
  subscriber has been loaded. Always `await` for it before using the
  instance.
- **set(key)** - sen an *extra* for the instance. It could be a DB
  or transport connection, configuration object, a constant, literally
  anything
- **get(key)** - get and *extra* previously set with `set()` method


Modules and methods
-------------------

*Module* is just a directory with files that represent *methods*. For
example:

```
🗀 service/
├── 🗀 modules/
│   ├── 🗀 user/
│   │   ├── 🖹 register.js
│   │   ├── 🖹 update.js
│   │   ├── 🖹 list.js
│   │   └── ...
│   └── 🗀 profile/
│       ├── 🖹 create.js
│       ├── 🖹 update.js
│       └── ...
```
We see two modules `user` and `profile` both of which have some methods.
These methods are available from anywhere via kojo instance:
- `kojo.modules.user.list()`
- `kojo.modules.profile.update()`
- etc

A method must export an `async` function that (usually) returns a value.
It has kojo instance and [logger] in its context:
```js
module.exports = async function () {

    const {kojo, logger} = this;  // instance and logger in context
    const {alpha, bravo} = kojo.modules;
    logger.debug(`called`);
    return await bravo.methodA();
};
```
**Important: for method's context to be available, the method must be
defined via `function() {}`, not arrow ()==>{}**

Modules are also `EventEmitter`s and can publish internal events. Thus
you can create 'internal' subscribers that listen to module's events.


Logger
------

Test
----

```
npm test
```

[Seneca]: http://senecajs.org/