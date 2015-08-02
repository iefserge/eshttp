'use strict';
var http = require('http');

var headers = { 'x-header': 'value' };

var server = http.createServer(function(req, res) {
  res.writeHead(200, headers);
  res.end('hello');
})

server.listen(8080);
console.log('http: listening to port 8080');
