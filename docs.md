API Documentation
=================

    
* [kojo](#module_kojo)
    * [Kojo](#exp_module_kojo--Kojo) ⏏
        * [new Kojo(options)](#new_module_kojo--Kojo_new)
        * [.config](#module_kojo--Kojo+config) : <code>Object</code>
        * [.id](#module_kojo--Kojo+id) : <code>string</code>
        * [.name](#module_kojo--Kojo+name) : <code>string</code>
        * [.ready()](#module_kojo--Kojo+ready) ⇒ <code>Promise</code>
        * [.set(key, value)](#module_kojo--Kojo+set)
        * [.get([key])](#module_kojo--Kojo+get) ⇒ <code>\*</code>

<a name="exp_module_kojo--Kojo"></a>

### Kojo ⏏
The Kojo class

**Kind**: Exported class  
<a name="new_module_kojo--Kojo_new"></a>

#### new Kojo(options)
Create Kojo instance


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | configuration options |
| options.subsDir | <code>string</code> | subscribers directory (relative to project root) |
| options.functionsDir | <code>string</code> | functions directory (relative to project root, default: 'functions', alternative: 'ops') |
| options.serviceDir | <code>string</code> | DEPRECATED: use functionsDir instead |
| options.parentPackage | <code>Object</code> | parent package, Kojo is running from. Needed to just display                                         parent package name version. Default is current project package.json |
| options.name | <code>string</code> | Kojo name (default `工場`) |
| options.icon | <code>string</code> | Kojo icon, usually an emoji (default `☢`) |
| options.logLevel | <code>string</code> | the log level (default: `debug`) |
| options.loggerIdSuffix | <code>boolean</code> | shall logger use Kojo ID prefix? (default: false) |

**Example**  
```js
const kojo = new Kojo({
    name: 'users',
    icon: 👥
});
```
<a name="module_kojo--Kojo+config"></a>

#### kojo.config : <code>Object</code>
Kojo instance configuration

**Kind**: instance property of [<code>Kojo</code>](#exp_module_kojo--Kojo)  
<a name="module_kojo--Kojo+id"></a>

#### kojo.id : <code>string</code>
Kojo instance unique ID

**Kind**: instance property of [<code>Kojo</code>](#exp_module_kojo--Kojo)  
**Example**  
```
user-service.zM8n6
```
<a name="module_kojo--Kojo+name"></a>

#### kojo.name : <code>string</code>
Kojo name

**Kind**: instance property of [<code>Kojo</code>](#exp_module_kojo--Kojo)  
**Example**  
```
user-service
```
<a name="module_kojo--Kojo+ready"></a>

#### kojo.ready() ⇒ <code>Promise</code>
Bootstrap Kojo instance. Resolves after every service and
subscriber has been loaded. Always `await` for it before using Kojo
instance.

**Kind**: instance method of [<code>Kojo</code>](#exp_module_kojo--Kojo)  
**Fulfil**: <code>Array</code> - 'tuple' with services and endpoints count  
**Example**  
```js
const kojo = new Kojo(options);
await kojo.ready();
```
<a name="module_kojo--Kojo+set"></a>

#### kojo.set(key, value)
Set key/value to the global context. Anything goes here - DB, transport connections,
configuration objects, etc. This is also called setting an 'extra'.

**Kind**: instance method of [<code>Kojo</code>](#exp_module_kojo--Kojo)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | key string |
| value | <code>\*</code> | value of any type |

**Example**  
```js
const client = await MongoClient.connect(config.mongodb.url);
kojo.set('mongo', client);
```
<a name="module_kojo--Kojo+get"></a>

#### kojo.get([key]) ⇒ <code>\*</code>
Get (previously `set`) value from state.

**Kind**: instance method of [<code>Kojo</code>](#exp_module_kojo--Kojo)  

| Param | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | key string (optional). If omitted, returns state object. |

**Example**  
```js
const client = await MongoClient.connect(config.mongodb.url);
kojo.get('mongo');
```

    
* [logger](#module_logger)
    * [module.exports](#exp_module_logger--module.exports) ⏏
        * [new module.exports(options)](#new_module_logger--module.exports_new)
        * [.debug(...args)](#module_logger--module.exports+debug) ⇒ <code>undefined</code>
        * [.warn(...args)](#module_logger--module.exports+warn) ⇒ <code>undefined</code>
        * [.error(...args)](#module_logger--module.exports+error) ⇒ <code>undefined</code>
        * [.info(...args)](#module_logger--module.exports+info) ⇒ <code>undefined</code>
        * [.setCustomTag(tag)](#module_logger--module.exports+setCustomTag) ⇒ <code>void</code>

<a name="exp_module_logger--module.exports"></a>

### module.exports ⏏
Kojo logger class

**Kind**: Exported class  
<a name="new_module_logger--module.exports_new"></a>

#### new module.exports(options)
Create Logger instance


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | configuration options |
| options.id | <code>string</code> | server instance id |
| options.icon | <code>object</code> | logger icon |
| options.level | <code>object</code> | logger level (default is `debug`) |
| options.tagSeparator | <code>string</code> | character to joint tagPieces with |
| options.tagPieces | <code>array</code> | array of values to form the tag from |
| options.color | <code>string</code> | special `chalk` color to use for this service method (default: white) |

**Example**  
```js
const logger = new Logger({icon, id, level, tagSeparator, tagPieces: [service, method], color: 'bold'})
```
<a name="module_logger--module.exports+debug"></a>

#### module.exports.debug(...args) ⇒ <code>undefined</code>
Write a debug entry

**Kind**: instance method of [<code>module.exports</code>](#exp_module_logger--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> | arguments to output with the entry's message |

<a name="module_logger--module.exports+warn"></a>

#### module.exports.warn(...args) ⇒ <code>undefined</code>
Write a warning entry. Will be rendered to 'stdout'.
Warn messages are rendered regardless of logging level (except for 'silent').

**Kind**: instance method of [<code>module.exports</code>](#exp_module_logger--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> | arguments to output with the entry's message |

<a name="module_logger--module.exports+error"></a>

#### module.exports.error(...args) ⇒ <code>undefined</code>
Write an error entry. Will be rendered to 'stderr'

**Kind**: instance method of [<code>module.exports</code>](#exp_module_logger--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> | arguments to output with the entry's message |

<a name="module_logger--module.exports+info"></a>

#### module.exports.info(...args) ⇒ <code>undefined</code>
Write an info entry

**Kind**: instance method of [<code>module.exports</code>](#exp_module_logger--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> | arguments to output with the entry's message |

<a name="module_logger--module.exports+setCustomTag"></a>

#### module.exports.setCustomTag(tag) ⇒ <code>void</code>
Sets a custom tag to the specified value.

**Kind**: instance method of [<code>module.exports</code>](#exp_module_logger--module.exports)  
**Returns**: <code>void</code> - - Does not return a value.  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>string</code> | The custom tag to be set. |

