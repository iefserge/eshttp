'use strict';
var eshttp = require('../index-node');

var request = new eshttp.HttpRequest('GET', '/ip', { 'host': 'httpbin.org' });
var client = new eshttp.HttpClient('54.175.222.246', 80);

console.log(request.toString());

for (var i = 0; i < 10; ++i) {
  client.request(request, function(err, response) {
    console.log('response: ' + response.statusCode + ' ' + response.statusMessage);

    response.ondata = function(u8) {
      console.log('body chunk', Buffer(u8).toString());
    };

    response.onend = function() {
      console.log('ended');
    };
  });
}

client.close();
