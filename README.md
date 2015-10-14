## eshttp

[![Build Status](https://travis-ci.org/iefserge/eshttp.svg?branch=master)](https://travis-ci.org/iefserge/eshttp)

Portable pure JavaScript ES6 HTTP library. Includes fast streaming regex-free parser for HTTP/1.0 and HTTP/1.1.

- pure JavaScript (ES6/2015)
- high-performance and low-level, no stream abstractions
- portable, multiple backends support (Node.js/other platforms)

## USAGE

```bash
npm install eshttp
```

Requires ES6/2015 JS engine (Node.js 4.0). Example web server using eshttp:

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

## BENCHMARK

```
$ node -v
v4.2.1
```

[Node.js builtin http module](https://github.com/iefserge/eshttp/blob/master/example/run-server-http.js):

```
$ wrk -t12 -c400 -d30s http://127.0.0.1:8080/
Running 30s test @ http://127.0.0.1:8080/
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    21.12ms    2.32ms  98.16ms   88.23%
    Req/Sec     1.25k   489.35     4.03k    83.52%
  336337 requests in 30.09s, 38.81MB read
  Socket errors: connect 155, read 181, write 0, timeout 0
Requests/sec:  11177.42
Transfer/sec:      1.29MB
```

[eshttp](https://github.com/iefserge/eshttp/blob/master/example/run-server-eshttp.js):

```
$ wrk -t12 -c400 -d30s http://127.0.0.1:8080/
Running 30s test @ http://127.0.0.1:8080/
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    11.46ms    1.75ms  76.40ms   94.03%
    Req/Sec     1.76k     1.36k    5.97k    62.83%
  630789 requests in 30.10s, 72.79MB read
  Socket errors: connect 155, read 130, write 21, timeout 0
Requests/sec:  20959.47
Transfer/sec:      2.42MB
```

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
