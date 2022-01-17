# gql-logger
**gql-logger** is a simple class-based logger designed to integrate with the graphql context argument. It provides traceability, basic logging, and console-based performance snapshots for production and development environments. 

**gql-logger** is built using typescript and ships with type support. It is configured to allow for easy implementation both with commonJS and ES6.
- [gql-logger](#gql-logger)
	- [Installation](#installation)
	- [Getting Started](#getting-started)
	- [Class: Logger](#class-logger)
		- [Arguments](#arguments)
		- [API](#api)
			- [start()](#start)
			- [end()](#end)
			- [error()](#error)
			- [debug()](#debug)
			- [info()](#info)
			- [warn()](#warn)
			- [refreshInstance()](#refreshinstance)
	- [Decorator: Log](#decorator-log)
		- [Usage Example](#usage-example)
	- [List Mode](#list-mode)
	- [Usage](#usage)
	- [Contribute](#contribute)
	- [Support](#support)

## Installation 
Using  **yarn**:
```
$ yarn add gql-logger 
```
Using  **npm**:
```
$ npm install gql-logger 
```
## Getting Started

**gql-logger** was designed for easy set-up with [apollo-server-express](https://www.npmjs.com/package/apollo-server-express). 


``` javascript
import Logger from 'gql-logger'

const logger = new Logger({
		// level defaults to 4 or `process.env.LOG_LEVEL` value
		appName: 'example-app',
	})

const server = new ApolloServer({
	resolvers: ... //,
	plugins: ... //,
	context: async ({ req }) => {
		const { headers, sessionID } = req;

		logger.refreshInstance({
			correlation: headers['x-correlation-id'],
			session: sessionID,
		})

		return {
			logger
		};
	},
	...//
});
```

## Class: Logger
### Arguments
| Name                      | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level: number?`          | 4           | This allows for control over which types of logs will be produced between different environments. Options are: `0: OFF`, `1: ERROR`, `2: INFO`, `3: WARN`, `4: DEBUG`.  **gql-logger** will first attempt to set the log level by checking for `process.env.LOG_LEVEL`. If the application does not use [dotenv](https://www.npmjs.com/package/dotenv), it reverts to the default value. The lower the value, the more conservative the logging. For example, setting `level` as `3` will cause the logger to ignore all `logger.debug()` calls. Setting a number less than `0` or greater than `4` will produce the same behaviour as though the level was set to `0` and `4` respectively. |
| `appName: string?`        | `undefined` | You can set the name of the application calling the logger. If not specified, the `app` field will not appear in the log output. This field is especially useful when utilizing a log aggregator across various applications.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `correlation: string?`    | `undefined` | This field is used to compose the `trace` output value. It requires that the `x-correlation-id` header be set for client requests. If `undefined`, it will substitute `UNSET` where the `x-correlation-id` would usually appear.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `session: string?`        | `undefined` | This argument can be used to store session IDs if using session-based authentication. If not set, the `session` field will not appear in the log output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `userId: string?`         | `undefined` | This argument can be used to store a user ID. If not set, the `userId` field will not appear in the log output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `identifier: string?`     | `undefined` | This can be used to store any other identifier appropriate to your application. If not set, the `identifier` field will not appear in the log output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `listMode: boolean?`      | `false`     | Setting this flag to `true` modifies the logger output to a condensed, readable pseudo stack-trace for an alternative logging style. See below for example outpus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `cascade: boolean?`       | `true`      | By default logs corresponding to functions within functions are grouped by indent, creating a cascading effect for easier readibility. This feature can be toggled off by passing `false`. Note that this will not affect the `listMode` default indentation.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `decoratorCount?: number` | `10`        | Because the `Log` decorator is event-driven, it can result in more than 10 listeners to a single event, triggering a NodeJS warning. Pass your decorator count so that NodeJS knows that the listeners in excess of 10 are intentional and not due to a memory leak.                                                                                                                                                                                                                                                                                                                                                                                                                         |


### API
The following methods are available: 
* [`Logger.prototype.start()`](#start)
* [`Logger.prototype.end()`](#end)
* [`Logger.prototype.error()`](#error)
* [`Logger.prototype.debug()`](#debug)
* [`Logger.prototype.info()`](#info)
* [`Logger.protoype.warn()`](#warn)

#### start()
The main method used when initiating logging for a given function. Internally `start()` calls `info` and starts a timer.
**Arguments**
* `self: string`
* `status: number?`

**Output**
``` javascript
{
  origin: 'someResolver',
  message: 'someResolver called',
  trace: 'UNSET-sktwieu0kukgnkwi',
  status: 200,
  ts: 1633824049556,
  type: 'info',
  session: 'some-session-id',
  app: 'anApp'
}
```
***
#### end()
The main method used to end the log for a given function. Internally `end()` calls `info` and ends a timer. 

**Arguments**
* `self: string`
* `status: number?`

**Output (`listMode === false`)**
``` javascript
{
  origin: 'someResolver',
  message: 'someResolver invoked successfully',
  trace: 'UNSET-sktwieu0kukgnkwi',
  status: 200,
  ts: 1633824049575,
  type: 'info',
  session: 'some-session-id',
  app: 'anApp'
}
getCreditsIssuedGraph - UNSET-sktwieu0kukgnkwi: 18.665ms
```
***
#### error()
The main method used to handle and log errors. The intention is that this method is used in conjunction with [Logger.prototype.start()](#start) in order to benchmark time-to-error. If the method is being used independently of the `start` method, you can pass the the value `false` for the optional 4th argument `timeEnd`. 

**Arguments**
* `self: string`
* `error: Error`
* `status: number?`
* `timeEnd: boolean (default = true)`

**Output**
``` javascript
{
	origin: 'someResolver',
	message: 'some error message',
	trace 'UNSET-sktwieu0kukgnkwi',
	status: 500,
	ts: 1633824049575,
	type: 'error',
	session: 'some-session-id',
	app: 'anApp'
}
getCreditsIssuedGraph - UNSET-sktwieu0kukgnkwi: 18.665ms
```
***
#### debug()

**Arguments**
* `origin: string`
* `message: string`
* `status: number?`

**Output**
``` javascript
{
	origin: 'someResolver',
	message: 'some custom message',
	trace 'UNSET-sktwieu0kukgnkwi',
	status: 200,
	ts: 1633824049575,
	type: 'debug',
	session: 'some-session-id',
	app: 'anApp'
}
```
***
#### info()
**Arguments**
* `origin: string`
* `message: string`
* `status: number?`
  
**Output**
``` javascript
{
	origin: 'someResolver',
	message: 'some custom message',
	trace 'UNSET-sktwieu0kukgnkwi',
	status: 200,
	ts: 1633824049575,
	type: 'info',
	session: 'some-session-id',
	app: 'anApp'
}
```
***
#### warn()

**Arguments**
* `origin: string`
* `message: string`
* `status: number?`
  
**Output**
``` javascript
{
	origin: 'someResolver',
	message: 'some custom message',
	trace 'UNSET-sktwieu0kukgnkwi',
	status: 400,
	ts: 1633824049575,
	type: 'warn',
	session: 'some-session-id',
	app: 'anApp'
}
```
***
#### refreshInstance()

**Arguments**
* `correlation?: string`
* `session?: string`
* `userId?: string`
* `identifier?: string`

**Description**
This function can be called within context creation to allow for logging through the course of a new request without having to re-instantiate the logger. This allows for the instance to be defined once, separately from context creation, while still maintaining request-specific state. 
***

## Decorator: Log
The `Log` decorator provides out-of-the-box logging without having to reimplement boiler-plate logging functionality for every eligible function. It is more geared towards business-logic rather than GraphQL resolvers themselves. This is because tools like `TypeGraphQL` ship with their own special methods that are required to make comatible decorators, and providing compatibility with such tools is beyond the scope of this package.

### Usage Example

```typescript
import { Log } from 'gql-logger';

class AuthHelper {
	@Log()
	async helpGenerateOTP() {
		const password = // some logic ;

		return `${password}`;
	}
}
```
This simple function would yield the following output in [List Mode](#list-mode): 
```javascript
<SOME_TRACE> => [ 'helpGenerateOTP - 1641875087166' ]  - 22ms
```
This clearly saves a lot of code when compared to the example shown in the [Usage](#usage) section.
## List Mode
If you set `listMode` to `true`, you do not have to change any other code. Be aware the in place of the outputs for `start()` and `end()`, the logger will output a single log to the console with the following format:
```javascript
<some-trace-id> => [
	'<some-function> - <some-timestamp>',
	'<some-function> - <some-timestamp>',
	'Error: <some-function> - <some-timestamp> - <error-message>', 
	...
] - 7ms
```
The major disadvantage of list mode is that other logs to the console will not be sandwiched between the start and end logs corresponding to thier caller (i.e. you see the order in which functions are called, but not necessarily the scope where they are called).
## Usage
Here is an example of where / how these methods are intended to be called from within a GraphQL resolver: 

``` javascript
const someResolver = async (root, { input }, context) => {
	const { logger } = context;
	const self = someResolver.name;
	logger.start(self)
	
	let res
	
	try {
		res = // logic
	} catch (e) {
		logger.error(self, e)
		throw e
	}
	
	logger.end(self)
	return res
}
```
And that's it!

## Contribute
This project is pretty small and the code should be easy to follow, but I am open to expanding functionality -- there is not enough here yet to warrant implementing a contribution standard, so I will review any PRs that come my way!

## Support
* [Buy me a coffee](https://www.buymeacoffee.com/dannyibrahim)
* [Read my writing](https://medium.com/@thedannyibrahim/about)