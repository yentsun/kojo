🏭 Kojo
=======

An event-driven microservice framework. Kōjō (工場) means 'factory' in Japanese.

Kojo is straightforward: it has **subscribers** (event handlers, routes, or endpoints) and **functions** (reusable business logic). *Subscribers* subscribe to pub/sub, request/response, or scheduled events from your chosen transport, and *functions* perform the business logic.

> **Note**: If you're upgrading from v8.x, see the [migration guide](CHANGELOG.md#900---2025-11-11). TL;DR: `services/` → `functions/`, `serviceDir` → `functionsDir`

[![Tests status](https://github.com/yentsun/kojo/workflows/Tests/badge.svg)](https://github.com/yentsun/kojo/actions)
[![Coverage Status](https://coveralls.io/repos/github/yentsun/kojo/badge.svg?branch=master)](https://coveralls.io/github/yentsun/kojo?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/yentsun/kojo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/yentsun/kojo?targetFile=package.json)


Installation
------------

```
 npm i kojo
```


What's New in v9.0.0
--------------------

- 🎯 **Root-level functions**: No need to create directories for simple functions (`functions/generateId.js`)
- 🔧 **Flexible naming**: Use `functions/`, `ops/`, or any name that fits your domain
- ⚠️ **Breaking change**: Default directory renamed `services/` → `functions/`
- [Full migration guide →](CHANGELOG.md#900---2025-11-11)


Usage
-----

**NOTE: This package uses native ESM modules (since v8.0.0).**

### Grouped functions (directory-based)

Create a function group with methods (`functions/user/create.js`):

```js
export default async function (userData) {

    const [ kojo, logger ] = this;  // kojo instance and logger
    const { pg: pool } = kojo.state;  // get previously set pg connection

    logger.debug('creating', userData);  // logger automatically adds function and method name
    const query = `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`;
    const result = await pool.query(query, [userData.name, userData.email]);
    const newRecord = result ? result.rows[0] : null;

    if (newRecord)
        logger.info('created', newRecord);

    return newRecord;
}
```

**Access**: `kojo.functions.user.create({ name: 'Alice', email: 'alice@example.com' })`

### Standalone functions (root-level)

For simple utilities, place them directly in the functions directory (`functions/generateId.js`):

```js
export default async function () {
    const [ kojo, logger ] = this;
    logger.debug('generating unique ID');
    return crypto.randomUUID();
}
```

**Access**: `kojo.functions.generateId()`


Create a subscriber (`subscribers/user.create.js`):

```js
export default async (kojo, logger) => {

    const { user } = kojo.functions;  // we defined `user` function group above
    const { nats } = kojo.state;  // get nats connection from state

    nats.subscribe('user.create', async (userData) => {

        logger.debug('received user.create event', userData);
        const newUser = await user.create(userData);

        if (newUser) {
            logger.info('user created, publishing event');
            nats.publish('user.created', newUser);
        }
    });
}
```


Initialize Kojo and add connections:

```js
import Kojo from 'kojo';
import pg from 'pg';
import NATS from 'nats';

async function main() {

    const kojo = new Kojo({
        name: 'users',
        icon: '👥'
    });

    // Set up connections
    const pool = new pg.Pool({
       user: 'pg_user',
       database: 'db_name',
       password: 'password',
       host: 'localhost'
    });
    kojo.set('pg', pool);  // accessible via kojo.get('pg')

    const nats = await NATS.connect({ servers: 'nats://localhost:4222' });
    kojo.set('nats', nats);

    // Initialize - loads all functions and subscribers
    await kojo.ready();

    console.log('Kojo ready! 🏭');
}

main().catch(console.error);
```


Functions
---------

Kojo supports two ways to organize functions:

### 1. Grouped functions (recommended for related logic)

A function group is a directory with files representing methods:

```
🗀 my-app/
├── 🗀 functions/
│   ├── 🗀 user/              ← Function group
│   │   ├── 🖹 register.js
│   │   ├── 🖹 update.js
│   │   ├── 🖹 list.js
│   │   └── 🖹 test.js        ← Ignored (reserved for unit tests)
│   ├── 🗀 profile/           ← Another function group
│   │   ├── 🖹 create.js
│   │   └── 🖹 update.js
│   └── 🖹 generateId.js      ← Root-level function (NEW in v9!)
```

These are available via:
- `kojo.functions.user.list()`
- `kojo.functions.profile.update()`
- `kojo.functions.generateId()`

### 2. Root-level functions (NEW in v9.0.0)

For simple utilities, place files directly in `functions/`:

```js
// functions/hashPassword.js
export default async function (password) {
    const [ kojo, logger ] = this;
    logger.debug('hashing password');
    return bcrypt.hash(password, 10);
}
```

**Access**: `kojo.functions.hashPassword('secret123')`

### Context injection

All functions receive kojo instance and [logger](#logger) via context:

```js
export default async function (userData) {

    const [ kojo, logger ] = this;  // context injection
    const { profile } = kojo.functions;  // access other functions

    logger.debug('creating profile', userData);
    return profile.create(userData);
}
```

**⚠️ Important**: Functions must use `function() {}` syntax, NOT arrow functions `() => {}`, to receive context.

### Internal events

Kojo extends `EventEmitter`, allowing internal pub/sub:

```js
// In a function - emit an event
export default async function (userData) {
    const [ kojo, logger ] = this;
    const newProfile = await createProfile(userData);
    kojo.emit('profile.created', newProfile);
    return newProfile;
}
```

```js
// In a subscriber - listen to internal events
export default async (kojo, logger) => {
    kojo.on('profile.created', (newProfile) => {
        logger.info('Profile created internally', newProfile.id);
        // Send notification, update cache, etc.
    });
};
```

**Note**: Files named `test.js` are automatically ignored (reserved for unit tests).


Subscribers
-----------

```
🗀 my-app/
├── 🗀 subscribers/
│   ├── 🖹 user.register.js      ← External event handler
│   ├── 🖹 user.update.js        ← External event handler
│   ├── 🖹 internal.user.created.js  ← Internal event handler
│   └── 🖹 http.get.users.js     ← HTTP route handler
```

A *subscriber* exports an async function **called once** during initialization. It sets up event listeners, HTTP routes, or scheduled tasks. Name files to reflect what they handle.

**Example - Internal event subscriber** (`subscribers/internal.user.registered.js`):

```js
export default async (kojo, logger) => {

    const { user } = kojo.functions;
    const nats = kojo.get('nats');

    kojo.on('user.registered', (newUser) => {
        logger.info('user registered, sending notification', newUser.id);
        nats.publish('notification.send', {
            userId: newUser.id,
            type: 'welcome'
        });
    });
}
```

**Example - HTTP route subscriber** (`subscribers/http.get.users.js`):

```js
export default async (kojo, logger) => {

    const { user } = kojo.functions;
    const app = kojo.get('express');

    app.get('/users', async (req, res) => {
        logger.debug('GET /users');
        const users = await user.list();
        res.json(users);
    });
}
```

**Note**: Unlike functions, subscribers can use arrow functions and receive kojo/logger as **arguments**, not context.


Logger
------

Kojo provides automatic context-aware logging. When logging from `user.register`, entries automatically include the function and method name:

```js
// In functions/user/register.js
logger.debug('registering user', userData);
```

**Output**:
```
👥 users.Xk9pL DEBUG [user.register] registering user {...user data}
```

The logger automatically adds:
- Instance name and ID (`users.Xk9pL`)
- Function and method name (`[user.register]`)
- Support for additional context via `logger.setCustomTag('request-id-123')`

You can use your own logger by setting it as state (`kojo.set('logger', customLogger)`), but you'll lose the automatic context tagging.


Docs
----

Read the [docs].


Configuration
-------------

```js
new Kojo({
    subsDir: 'subscribers',      // Subscribers directory (default)
    functionsDir: 'functions',   // Functions directory (default)
    name: '工場',                // Instance name (default: factory)
    icon: '☢',                   // Display icon (default)
    logLevel: 'debug',           // Log level: debug, info, warn, error, silent
    loggerIdSuffix: false,       // Append instance ID to logs (default: false)
    parentPackage: null          // Parent package.json for version display
})
```

### Flexible naming

The directory name determines the API property name:

```js
// Default
new Kojo({ functionsDir: 'functions' })
→ kojo.functions.*

// Domain-specific naming
new Kojo({ functionsDir: 'ops' })
→ kojo.ops.*

new Kojo({ functionsDir: 'handlers' })
→ kojo.handlers.*
```


Logic placement strategy
------------------------

**Rule of thumb**: Place logic in **subscribers** when in doubt. Move to **functions** when:
- Code starts repeating across subscribers
- Logic becomes complex and needs to be DRY
- Functionality needs to be reusable

**Subscribers** are entry points - they make it obvious what events your microservice handles. **Functions** contain the reusable business logic. By examining the subscribers directory, you should immediately understand what the microservice does.


Test
----

```
npm test
```

Troubleshooting
---------------

### JSON module import error

If you see:
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".json"
```

Launch your service with:
```bash
node service.js --experimental-json-modules
```

Or update to Node.js 18+ which handles JSON imports better.

### Deprecated warnings

If you see:
```
Warning: "serviceDir" is deprecated. Please use "functionsDir" instead.
```

Update your config:
```js
// Old
new Kojo({ serviceDir: 'services' })

// New
new Kojo({ functionsDir: 'services' })
```


Links
-----

- [API Documentation](docs.md)
- [Changelog](CHANGELOG.md)
- [GitHub](https://github.com/yentsun/kojo)
