'use strict';
var eshttp = require('../index-node');
var HttpClient = eshttp.HttpClient;
var HttpRequest = eshttp.HttpRequest;

var request = new HttpRequest('GET', '/', { 'x-header': 'value' });
var client = new HttpClient('127.0.0.1', 8080);

for (var i = 0; i < 10; ++i) {
  client.request(request, function(err, response) {
    console.log('response: ' + response.statusCode + ' ' + response.statusMessage);

    response.ondata = function(u8) {
      console.log('body chunk', u8);
    };

    response.onend = function() {
      console.log('ended')
    };
  });
}

client.close();
