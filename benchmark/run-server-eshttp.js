'use strict';
var eshttp = require('../index-node');
var HttpServer = eshttp.HttpServer;
var HttpResponse = eshttp.HttpResponse;

var server = new HttpServer();
var response = new HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = function(request) {
  request.respondWith(response);
};

server.listen(8080);
console.log('eshttp: listening to port 8080');
