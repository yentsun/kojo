[6.2.0] - 2019-05-13
--------------------
- [x] `kojo.ready()` returns service / subscriber counts
- [x] Increase code coverage


[6.1.0] - 2019-05-13
--------------------
- [x] Add `warn` logger level


[6.0.0] - 2019-04-09
--------------------
- [x] Move event emitting from services to the root kojo app


[5.3.0] - 2019-02-10
--------------------
- [x] Rename `_extras` to `state`
- [x] Update dependencies


[5.2.1] - 2018-11-29
--------------------
- [x] Fix log level bug for Logger


[5.2.0] - 2018-11-12
--------------------
- [x] Provide basic deserialization for object type arguments


[5.1.3] - 2018-10-08
--------------------
- [x] Move new line char to the end of rendered string @ Logger


[5.1.2] - 2018-10-07
--------------------
- [x] Render log entries in one line to prevent separation in pm2


[5.1.0] - 2018-09-24
--------------------
- [x] Make Logger usable separately
- [x] Optimise Logger
- [x] Rename `options.loggerIdPrefix` to `options.loggerIdSuffix`


[5.0.0] - 2018-09-02
--------------------
- [x] Remove `TRACE` and `WARN` log level
- [x] Remove `loglevel` from dependencies
- [x] Switch Logger to custom one (that uses `process.stdout.write`)
- [x] Rename `loglevel` option to `logLevel`
- [x] Rename `modules` to `services`


[4.3.0] - 2018-06-27
--------------------
- [x] Module's method can be a sync function
- [x] Day of birth


[4.2.0] - 2018-06-20
--------------------
- [x] Introduce `options.loglevel`
- [x] Change logger to chalked loglevel
- [x] Change `console.log` to `process.stdout.write` for splash screen
- [x] Update dependencies


[4.1.0] - 2018-05-31
--------------------
- [x] Add JSDoc
- [x] Add services/subscribers count at splash screen
- [x] Add subscribers alias (based on directory name)


[4.0.1] - 2018-05-02
--------------------
- [x] Increase code coverage #8


[4.0.0] - 2018-04-29
--------------------
- [x] Single options object with default values
- [x] Allow module-less / subscriber-less config
- [x] Modules are accessible via `kojo.services.serviceName`
- [x] Drop `kojo.module()` method
- [x] Add more docs


[3.3.0] - 2018-04-21
--------------------
- [x] Multiple extras unpacking #6
- [x] Add kojo icon #5


[3.2.3] - 2018-04-14
--------------------
- [x] Improve subscribers loading
- [x] Update `trid` version


[3.2.2] - 2018-04-04
--------------------
- [x] subscriber logger fix


[3.2.0] - 2018-04-02
--------------------
- [x] Add splash #3
- [x] Replace `shortid` with `trid`
- [x] Drop `moment` dependency
- [x] Add travis and coveralls
- [x] Drop `chai` dependency
- [x] Improve code coverage
- [x] Move tests into `test` directory
- [x] Rename `plant` to `kojo` @ module context #4


[3.1.0] - 2018-03-31
--------------------
- [x] Drop `yt-config` dependency #2


[3.0.4] - 2017-12-19
-------------------
- [x] Move package to yentsun/plant


[3.0.2] - 2017-12-15
--------------------
- [x] Update readme


[3.0.0] - 2017-12-15
--------------------
- [x] Move from callbacks to async/await globally fix #1
- [x] Unlicense


[2.2.2] - 2017-10-13
--------------------
- [x] Remove 'debug' level from stderr stream


[2.2.1] - 2017-09-04
--------------------
- [x] ADDED splash screen fix


[2.1.1] - 2017-07-31
--------------------
- [x] FIXED minor bug in loading of the async module methods
- [x] ADDED mandatory callback to `config` event callback


[2.0.0] - 2017-07-19
--------------------
- [x] ADDED module getter, extras getter and setter
- [x] ADDED unit tests
- [x] ADDED module cross-module calls
- [x] ADDED config module fix
- [x] REMOVED standard js


[1.1.2] - 2017-06-13
--------------------
- [x] FIXED loading of the async module methods


[1.1.1] - 2017-07-06
--------------------
- [x] FIXED `bluebird` module import


[1.1.0] - 2017-07-04
--------------------
- [x] ADDED support for services written using promises


[1.0.0] - 2017-06-07
--------------------
- [x] CHANGED to 'no builds' (node native es6) scheme


[0.1.3] - 2017-05-18
--------------------
- [x] ADDED build path for loading from tests


[0.1.2] - 2017-05-17
--------------------
- [x] FIXED readme syntax highlight


[0.1.1] - 2017-05-17
--------------------
- [x] ADDED content to README


[0.1.0] - 2017-05-17
--------------------
- [x] ADDED basic functionality
