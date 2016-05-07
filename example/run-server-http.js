'use strict';
const http = require('http');

const headers = { 'x-header': 'value', 'content-length': 5 };

const server = http.createServer((req, res) => {
  res.writeHead(200, headers);
  res.end('hello');
});

server.listen(8080);
console.log('http: listening to port 8080');
