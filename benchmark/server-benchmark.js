'use strict';

process.env.NODE_ENV = 'test';
if (!global.performance) {
  global.performance = {
    now: require('performance-now')
  };
}

function U8(str) {
  var u8 = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    u8[i] = str.charCodeAt(i);
  }
  return u8;
}

var eshttp = require('../index-node');
var HttpServer = eshttp.HttpServer;
var HttpResponse = eshttp.HttpResponse;
var backend = require('../backend/backend-test');

var server = new HttpServer();
var response = new HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = function(request) {
  request.respondWith(response);
};
server.listen(8080);

var tcpServer = backend.getServer();

function onsend(u8) {
  if (u8[0] !== 72 || u8[1] !== 84 || u8[2] !== 84) {
    throw new Error('non 200 response');
  }
};
function onclose() {};

var data = U8([
  'GET / HTTP/1.1',
  'Connection: close',
  'Host: localhost:8080',
  'Accept: text/html, text/plain',
  'User-Agent: http-test',
  '',
  ''
].join('\r\n'));

console.log('started...');
var time = performance.now();

var COUNT = 100000;

for (var i = 0; i < COUNT; ++i) {
  var conn = tcpServer.addConnection(onsend, onclose);
  conn.data(data);
}

var timeEnd = (performance.now() - time) | 0;
console.log('done ' + COUNT + ' connections in ' + timeEnd + 'ms (' + (timeEnd / COUNT).toFixed(4) + 'ms per connection)');
server.close();
process.exit();
