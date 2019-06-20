🏭 Kojo
=======

An event-driven microservice framework. Kōjō (工場) means 'factory' in
Japanese.

The idea of this framework emerged after couple of years of using
[Seneca], which in turn is a great tool for building microservices but probably wants to be
too abstract.

Kojo, on the other hand, is very straightforward: it has subscribers (or routes, or endpoints),
services and methods which are just plain functions. *Subscribers* susbscribe to a
pub/sub (or request/response, or a schedule) transport of your choice and call services
while *services* perform various tasks via their *methods*.

[![Build Status](https://travis-ci.org/yentsun/kojo.svg?branch=master)](https://travis-ci.org/yentsun/kojo)
[![Coverage Status](https://coveralls.io/repos/github/yentsun/kojo/badge.svg?branch=master)](https://coveralls.io/github/yentsun/kojo?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/yentsun/kojo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/yentsun/kojo?targetFile=package.json)


Installation
------------

```
 npm i kojo
```


Usage
-----
 
Create a service with a method (`services/user/create.js`):

 ```js
module.exports = async function (userData) {
    
    const {kojo, logger} = this;  // kojo instance and the logger

    logger.debug('creating', userData);  // logger will automatically add module and method name
    const pool = kojo.get('pg');  // get previously set pg connection
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

    const {user} = kojo.services;  // we defined `user` service above
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

    await kojo.ready();  // await for services and subscribers to initialize
}

return main();

```


Services and their methods
--------------------------

*Service* is just a directory with files which represent *methods*. For
example:

```
🗀 kojo/
├── 🗀 services/
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
We see two services `user` and `profile` both of which have some methods.
These methods are available from anywhere via kojo instance:
- `kojo.services.user.list()`
- `kojo.services.profile.update()`
- etc

A method file must export an `async` function which (usually) returns a value.
It will have kojo instance and [logger](#logger) in its context:
```js
module.exports = async function () {

    const {kojo, logger} = this;  // instance and logger in context
    ...
    const {profile} = kojo.services;
    logger.debug('creating profile', userData);
    return await profile.create(userData);
};
```
**Important: for method's context to be available, the method must be
defined via `function() {}`, not arrow `()=>{}`**

Kojo is also an `EventEmitter` and can publish internal events:
```js
...
const {kojo, logger} = this;
...
kojo.emit('profile.created', newProfile);
...
kojo.on('profile.created', (newProfile) => {
...
});

```

Thus, you can create 'internal' subscribers which listen to events.

Note: *Methods named `test` are ignored and not registered. These are
reserved for unit tests.*


Subscribers
-----------

```
🗀 kojo/
├── 🗀 subscribers/
│   ├── 🖹 user.register.js
│   ├── 🖹 user.update.js
│   ├── 🖹 profile.created.js
│   └── ...
```

*Subscriber* exports an async function which is **called once** during kojo
initialization and is not available otherwise. It is supposed to have a
single subscription to a pub/sub transport subject or services's internal
event, or http route and is recommended to be named accordingly. For
example, `subscribers/internal.user.registered.js`:
```js
module.exports = async (kojo, logger) => {

    const {user} = kojo.services;
    const nats = kojo.get('nats');
    user.on('registered', (newUser) => {
        logger.debug('publishing notification');
        nats.publish('notification', newUser);
    });
};

```
Unlike *service method*, subscriber function can be defined via arrow and
has kojo instance and logger as arguments, not context.


Logger
------

Kojo uses a custom mechanism for 'smart' logging from subscribers and services.
'Smart' means that if you log from method `user.register`, log entries
will include "user.register":
```js
logger.debug('registering', userData);
```

```
☢ test.QOmup DEBUG [user.register] registering {...}
```

You can always use your own logger, provided you register it as an extra,
but this logger will, of course, not have this 'smart' feature.


Docs
----

Read the [docs].


Logic placement strategy
------------------------

It is sometimes difficult to decide on where business logic should
reside: subscribers or services. A rule of a thumb could be the
following - **place logic inside subscribers when in doubt**. When code
starts repeating or getting complicated - its time for
introducing some services to keep it DRY and maintainable.

Subscriber should be the single point of entry for an event bound to your
microservice, external or internal. You should be able to easily tell
what exactly a microservice is responsible for by just looking at its
subscribers directory. You can then track the rest of the logic by
inspecting a subscriber and following the services it uses.


Test
----

```
npm test
```


[Seneca]: http://senecajs.org/
[docs]: docs.md
