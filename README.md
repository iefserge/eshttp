## eshttp

[![Build Status](https://travis-ci.org/iefserge/eshttp.svg?branch=master)](https://travis-ci.org/iefserge/eshttp)

Portable pure JavaScript ES6 HTTP library.

Design goals:

- pure JavaScript (ES6)
- high-performance and low-level, no stream abstractions
- portable, multiple backends support (Node/other platforms)
- fetch API frontend support

work in progress...

## USAGE

```bash
npm install eshttp
```

Requires ES6 (Node.js 4.0). Example web server using eshttp:

```js
'use strict';
const eshttp = require('eshttp');
const server = new eshttp.HttpServer();
const response = new eshttp.HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = request => {
  request.respondWith(response);
};

server.listen(8080);
```

## TODO

- parser improvements
- chunked responses
- fetch api

## API

```js
const eshttp = require('eshttp');
```

### eshttp.HttpResponse

Represents immutable HTTP response.

#### HttpResponse.constructor(code, headers, body)

Construct immutable HTTP response object that can be reused multiple times to serve different clients.

Argument | Type | Description
--- | --- | ---
code | number | HTTP code
headers | Headers \| object | Response headers object
body | string | Response body string

```js
const response = new eshttp.HttpResponse(200, { server: 'eshttp' }, 'OK.');
```

### eshttp.HttpRequest

Represents immutable HTTP request.

#### HttpRequest.constructor(method, path, headers, body)

Construct immutable HTTP request object that can be reused multiple times.

Argument | Type | Description
--- | --- | ---
method | string | HTTP request method (e.g. 'GET')
path | string | Request path
headers | Headers \| object | Request headers object
body | string | Request body string (optional)

```js
const request = new eshttp.HttpRequest('GET', '/', { 'User-Agent': 'eshttp' });
```

### eshttp.HttpServer

Represents HTTP server.

#### HttpServer.constructor()

Construct HTTP server object.

```js
const server = new eshttp.HttpServer();
```

#### HttpServer.listen(port)

Start listening to HTTP requests.

```js
server.listen(8080);
```

#### HttpServer.close()

Stop listening.

```js
server.close();
```

#### HttpServer.onrequest = function(request)

Request handler callback.

```js
server.onrequest = request => {
  console.log('new incoming request');
};
```

##LICENSE

MIT
