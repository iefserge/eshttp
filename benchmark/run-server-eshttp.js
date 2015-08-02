'use strict';
var eshttp = require('../index-node');
var HTTPServer = eshttp.HTTPServer;
var HTTPResponse = eshttp.HTTPResponse;

var server = new HTTPServer();
var response = new HTTPResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = function(request) {
  request.respondWith(response);
};

server.listen(8080);
console.log('eshttp: listening to port 8080');
