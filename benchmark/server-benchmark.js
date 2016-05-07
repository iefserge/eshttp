'use strict';

process.env.NODE_ENV = 'test';
if (!global.performance) {
  global.performance = {
    now: require('performance-now')
  };
}

function U8(str) {
  const u8 = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    u8[i] = str.charCodeAt(i);
  }
  return u8;
}

const eshttp = require('../index-node');
const HttpServer = eshttp.HttpServer;
const HttpResponse = eshttp.HttpResponse;
const backend = require('../backend/backend-test');

const server = new HttpServer();
const response = new HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = function(request) {
  request.respondWith(response);
};
server.listen(8080);

const tcpServer = backend.getServer();

function onsend(u8) {
  if (u8[9] !== '2' || u8[10] !== '0' || u8[11] !== '0') {
    throw new Error('non 200 response');
  }
};
function onclose() {};

const data = U8([
  'GET / HTTP/1.1',
  'Connection: close',
  'Host: localhost:8080',
  'Accept: text/html, text/plain',
  'User-Agent: http-test',
  '',
  ''
].join('\r\n'));

console.log('started...');
const time = performance.now();

const COUNT = 100000;

for (let i = 0; i < COUNT; ++i) {
  const conn = tcpServer.addConnection(onsend, onclose);
  conn.data(data);
}

const timeEnd = (performance.now() - time) | 0;
console.log('done ' + COUNT + ' connections in ' + timeEnd + 'ms (' + (timeEnd / COUNT).toFixed(4) + 'ms per connection)');
server.close();
process.exit();
