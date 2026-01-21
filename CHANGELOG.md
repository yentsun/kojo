[9.0.4] - 2026-01-21
--------------------

### 🔧 INTERNAL

- **Migrate to Node.js built-in test runner** - Replace mocha with native `node --test` (#41)
- Remove sinon dependency (no longer needed with native test runner)

### 📚 DOCUMENTATION

- **Expand API docs** to include Logger class with full JSDoc documentation (#42)

[9.0.2] - 2025-11-11
--------------------

### 📚 DOCUMENTATION

- **Complete README overhaul** for v9.0.0
  - Update all examples from `services/` to `functions/`
  - Update all code examples from `kojo.services.*` to `kojo.functions.*`
  - Add "What's New in v9.0.0" section with migration notice
  - Add root-level function examples and documentation
  - Add Configuration section with flexible naming examples
  - Add HTTP route and internal event subscriber examples
  - Modernize troubleshooting section
  - Remove outdated Seneca comparison
- **API docs regenerated** from JSDoc (shows `functionsDir` and deprecated `serviceDir`)
- **Add jsdoc-to-markdown** to devDependencies for future doc generation

[9.0.1] - 2025-11-11
--------------------

### 🔒 SECURITY

- Update mocha from 9.1.3 to 11.7.5 (fixes nanoid and serialize-javascript vulnerabilities)
- Replace deprecated coveralls npm package with GitHub Action (fixes critical request, form-data, and tough-cookie vulnerabilities)
- Update GitHub Actions to v4 (checkout and setup-node)
- All npm audit vulnerabilities resolved (0 vulnerabilities)

[9.0.0] - 2025-11-11
--------------------

### 🚨 BREAKING CHANGES

- **Default directory renamed**: `services/` → `functions/`
  - If you relied on the default, your app will look for `functions/` directory
  - **Fix**: Rename your `services/` directory to `functions/`
  - **OR**: Explicitly set `functionsDir: 'services'` in config

- **Config option renamed**: `serviceDir` → `functionsDir`
  - Old option still works but shows deprecation warning
  - **Recommended**: Update config to use `functionsDir`

### ✨ NEW FEATURES

- **Root-level functions**: You can now place functions directly in the functions directory
  - `functions/functionName/method.js` → `kojo.functions.functionName.method()` (existing)
  - `functions/standalone.js` → `kojo.functions.standalone()` (NEW!)
  - Both styles work simultaneously

- **Flexible naming**: Directory name determines API property name
  - `functionsDir: 'functions'` → `kojo.functions.*` (default)
  - `functionsDir: 'ops'` → `kojo.ops.*` (alternative)
  - `functionsDir: 'services'` → `kojo.services.*` (backward compatible)

### 📚 MIGRATION GUIDE

**Option 1: Rename directory (recommended)**
```bash
mv services functions
```

**Option 2: Keep old directory name**
```js
new Kojo({
    functionsDir: 'services',  // Explicitly set to 'services'
    // ... other options
})
```

**Option 3: Migrate gradually**
```js
// Still works, shows deprecation warning
new Kojo({
    serviceDir: 'services',  // ⚠️ DEPRECATED
})

// New way (no warning)
new Kojo({
    functionsDir: 'services',  // ✅ Recommended
})
```

### 📖 RATIONALE

- "Services" implies running processes, but these are callable functions
- "Functions" better describes the actual behavior
- Root-level support reduces unnecessary nesting for simple functions

[8.4.1] - 2025-08-10
--------------------
- [x] Refactor logger to use `setCustomTag` instead of `addTag` and update related test cases


[8.4.0] - 2025-08-10
--------------------
- [x] Add `addTag` method to logger and update test case


[8.2.1] - 2022-02-20
--------------------
- [x] Update Node engine version @ `.github`


[8.2.0] - 2022-02-20
--------------------
- [x] Add import assertion types to fit Node `v16.14`


[8.1.1] - 2021-12-16
--------------------
- [x] Update dependencies


[8.1.0] - 2020-11-08
--------------------
- [x] Make context have `services` renamed to what `options.serviceDir` is (#29)


[8.0.2] - 2020-10-30
--------------------
- [x] Move to ESM (#27)
- [x] Rewrite docs for ESM (#27)


[7.0.1] - 2020-10-19
--------------------
- [x] Update dependencies
- [x] Make tests win compatible


[7.0.0] - 2019-06-20
--------------------
- [x] Remove `jsdoc-to-markdown` dev dependency (#20)
- [x] Substitute 'Object' context with array one (#19)


[6.2.1] - 2019-05-13
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
