'use strict';
const eshttp = require('../index-node');
const HttpClient = eshttp.HttpClient;
const HttpRequest = eshttp.HttpRequest;

const request = new HttpRequest('GET', '/', { 'x-header': 'value' });
const client = new HttpClient('127.0.0.1', 8080);

for (let i = 0; i < 10; ++i) {
  client.request(request, function(err, response) {
    console.log('response: ' + response.statusCode + ' ' + response.statusMessage);

    response.ondata = function(u8) {
      console.log('body chunk', u8);
    };

    response.onend = function() {
      console.log('ended');
    };
  });
}

client.close();
