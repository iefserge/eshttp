'use strict';
var http = require('http');

var headers = { 'x-header': 'value', 'content-length': 5 };

var server = http.createServer((req, res) => {
  res.writeHead(200, headers);
  res.end('hello');
});

server.listen(8080);
console.log('http: listening to port 8080');
