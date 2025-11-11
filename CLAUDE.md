# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kojo is an event-driven microservice framework. The name Kōjō (工場) means 'factory' in Japanese. It provides a straightforward approach to building microservices with subscribers, services, and methods that are plain functions.

**Important**: This project uses native ESM modules (type: "module" in package.json). All imports must use ES6 syntax and file extensions.

## Development Commands

### Testing
```bash
npm test                                    # Run all tests with mocha
npm test -- --grep "pattern"                # Run tests matching pattern
./node_modules/.bin/mocha test/test.js      # Run specific test file
```

Tests use:
- Mocha as the test framework
- Sinon for spies/stubs/mocks
- Node's native `assert` module
- c8 for coverage reporting

When running services that import package.json, use:
```bash
node service.js --experimental-json-modules
```

### Documentation
```bash
npm run docs    # Generate API docs from JSDoc comments using jsdoc2md
```

## Architecture

### Core Classes

**Kojo (index.js)** - Main class extending EventEmitter
- Manages initialization of services and subscribers
- Provides global state management via `set()`/`get()`
- Acts as event bus for internal events
- Creates unique instance IDs using TrID

**Service (lib/Service.js)** - Service loader and wrapper
- Loads method files from service directories
- Wraps methods to inject context: `[kojo, logger]`
- Supports both async and sync methods
- Methods named `test.js` are ignored (reserved for unit tests)

**Logger (lib/Logger.js)** - Smart logging system
- Automatically tags logs with service.method names
- Uses chalk for colored output
- Configurable log levels: debug, info, warn, error, silent
- `setCustomTag()` to add additional context to log tags

### Directory Structure

```
functions/          # Functions directory (configurable, alternative: 'ops')
├── functionName/   # Grouped functions (directory-based)
│   ├── method1.js  # Each file = one method
│   ├── method2.js
│   └── test.js     # Ignored - for unit tests
└── standalone.js   # Root-level function (NEW: single function per file)

subscribers/        # Subscriber files (initialized once at startup)
├── event.name.js   # Name should reflect the event/route handled
└── internal.*.js   # Convention for internal event handlers
```

### Functions

Functions export an async function with context binding. Two styles are supported:

**Directory-based (grouped functions):**
```js
// functions/serviceName/methodName.js
export default async function (params) {
    const [kojo, logger] = this;  // Context provided by framework
    // ... implementation
}
```
Access: `kojo.functions.serviceName.methodName()`

**Root-level (standalone functions):**
```js
// functions/standaloneName.js
export default async function (params) {
    const [kojo, logger] = this;  // Context provided by framework
    // ... implementation
}
```
Access: `kojo.functions.standaloneName()`

**Critical**: Functions must use `function() {}` syntax, NOT arrow functions `() => {}`, to receive context.

### Subscribers

Subscribers export an async function called once during initialization:

```js
export default async (kojo, logger) => {
    // Set up subscriptions, routes, or event listeners
    // This runs once at startup
}
```

Unlike methods, subscribers can use arrow functions and receive `kojo` and `logger` as arguments.

### State Management

- `kojo.set(key, value)` - Store connections, config, etc. (called "extras")
- `kojo.get(key)` - Retrieve stored values
- `kojo.get()` - Get entire state object
- Common extras: database connections, message queue clients, configuration

### Internal Events

Kojo extends EventEmitter, enabling internal pub/sub:
- `kojo.emit('event.name', data)` - Emit events from methods
- `kojo.on('event.name', handler)` - Listen in subscribers or methods

## Key Configuration Options

When initializing Kojo:
```js
new Kojo({
    subsDir: 'subscribers',      // Subscribers directory (default)
    functionsDir: 'functions',   // Functions directory (default, alternative: 'ops')
    name: '工場',                // Instance name (default)
    icon: '☢',                   // Display icon (default)
    logLevel: 'debug',           // Log level (default)
    loggerIdSuffix: false,       // Append ID to logger output (default)
    parentPackage: null          // Parent package.json for version display
})
```

**Note**: The directory name determines the property name (e.g., `functionsDir: 'ops'` → `kojo.ops.*`)

## Logic Placement Strategy

**Rule of thumb**: Place logic in subscribers when in doubt. Move to functions when:
- Code starts repeating across subscribers
- Logic becomes complex and needs to be DRY
- Functionality needs to be reusable across multiple subscribers

Subscribers should be the single entry point for events, making it easy to understand what the microservice handles by examining the subscribers directory. Functions contain the reusable business logic.

## Important Notes

- Methods named `test.js` are automatically ignored during service loading
- The framework automatically wraps methods with error logging
- Logger automatically includes service.method context in log output
- Services and subscribers are loaded in parallel during `kojo.ready()`
- Always `await kojo.ready()` before using the instance
