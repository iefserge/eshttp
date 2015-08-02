## eshttp

[![Build Status](https://travis-ci.org/iefserge/eshttp.svg?branch=master)](https://travis-ci.org/iefserge/eshttp)

Modern ES6-style pure JavaScript HTTP library.

Design goals:

- pure JavaScript (ES6)
- high-performance and low-level, no stream abstractions
- multiple backends support (Node/other platforms)
- fetch API frontend support

work in progress...

## USAGE

Requires ES6 (io.js). Example web server using eshttp:

```js
let eshttp = require('eshttp');
let HTTPServer = eshttp.HTTPServer;
let HTTPResponse = eshttp.HTTPResponse;

let server = new HTTPServer();
let response = new HTTPResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = function(request) {
  request.respondWith(response);
};

server.listen(8080);
console.log('listening to port 8080');
```

## TODO

- handle invalid http requests
- keep alive support
- chunked responses
- http client and http response parser
- fetch api

##LICENSE

MIT
