# gql-logger
**gql-logger** is a simple class-based logger designed to integrate with the graphql context argument. It provides traceability, basic logging, and console-based performance snapshots for production and development environments. 

**gql-logger** is built using typescript and ships with type support. It is configured to allow for easy implementation both with commonJS and ES6.

## Table of Contents
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Set-up With Apollo-Server Express](#set-up-with-apollo-server-express)
  - [API](#api)
    - [start()](#start)
      - [Arguments](#arguments)
      - [Output](#output)
    - [end()](#end)
      - [Arguments](#arguments-1)
      - [Output](#output-1)
    - [error()](#error)
      - [Arguments](#arguments-2)
      - [Output](#output-2)
    - [debug()](#debug)
      - [Arguments](#arguments-3)
      - [Output](#output-3)
    - [info()](#info)
      - [Arguments](#arguments-4)
      - [Output](#output-4)
    - [warn()](#warn)
      - [Arguments](#arguments-5)
      - [Output](#output-5)
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

**gql-logger** was designed for easy set-up with [apollo-server-express](https://www.npmjs.com/package/apollo-server-express).  It accepts the following arguments: 

* **`level: number?`** - this allows for control over which types of logs will be produced between different environments. Options are: `0: OFF`, `1: ERROR`, `2: INFO`, `3: WARN`, `4: DEBUG`.  **gql-logger** will first attempt to set the log level by checking for `process.env.LOG_LEVEL`. If the application does not use [dotenv](https://www.npmjs.com/package/dotenv), the default value is `4`. The lower the value, the more conservative the logging. For example, setting `level` as `3` will cause the logger to ignore all `logger.debug()` calls. Setting a number less than `0` or greater than `4` will produce the same behaviour as though the level was set to `0` and `4` respectively. 

* **`appName: string?`** -  you can set the name of the application calling the logger. If not specified, the `app` field will not appear in the log output. This field is especially useful if your application logs dump to a common aggregator across our various applications

* **`correlation: string?`** - this field is used to compose the `trace` output value. It requires that the `x-correlation-id` header be set for client requests. If not `undefined`, it will default to `UNSET` to help you distinguish between the absence of the `x-correlation-id` header and other possible errors. 

* **`session: string?`** - can be used to store session IDs if using session-based authentication. If not set, the `session` field will not appear in the log output. 

* **`userId: string?`** - can be used to store a user ID. If not set, the `userId` field will not appear in the log output. 

* **`identifier: string?`** - can be used to store any other identifier appropriate to your application. If not set, the `identifier` field will not appear in the log output. 

### Set-up With Apollo-Server Express

``` javascript
import { Logger } from 'gql-logger'

const server = new ApolloServer({
	resolvers: ... //,
	plugins: ... //,
	context: async ({ req }) => {
		const { headers, sessionID } = req;
		return {
			logger: new Logger({
				// level defaults to 4 or `process.env.LOG_LEVEL` value
				appName: 'example-app',
				correlation: headers['x-correlation-id'],
				session: sessionID,
			}),
		};
	},
	...//
});
```

## API
The following methods are available: 
* [`Logger.prototype.start()`](#start)
* [`Logger.prototype.end()`](#end)
* [`Logger.prototype.error()`](#error)
* [`Logger.prototype.debug()`](#debug)
* [`Logger.prototype.info()`](#info)
* [`Logger.protoype.warn()`](#warn)

### start()
The main method used when initiating logging for a given function. Internally `start()` calls `info` and starts a timer.
#### Arguments
* `self: string`
* `status: number?`

#### Output
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
### end()
The main method used to end the log for a given function. Internally `end()` calls `info` and ends a timer. 

#### Arguments
* `self: string`
* `status: number?`

#### Output
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
### error()
The main method used to handle and log errors. The intention is that this method is used in conjunction with [Logger.prototype.start()](#start) in order to benchmark time-to-error. If the method is being used independently of the `start` method, you can pass the the value `false` for the optional 4th argument `timeEnd`. 
#### Arguments
* `self: string`
* `error: Error`
* `status: number?`
* `timeEnd: boolean (default = true)`

#### Output
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
### debug()
#### Arguments
* `origin: string`
* `message: string`
* `status: number?`
#### Output
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
### info()
#### Arguments
* `origin: string`
* `message: string`
* `status: number?`
#### Output
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
### warn()
#### Arguments
* `origin: string`
* `message: string`
* `status: number?`
#### Output
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