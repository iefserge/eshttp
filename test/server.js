'use strict';
var test = require('tape');
var HttpServer = require('../lib/http-server');
var HttpResponse = require('../lib/http-response');
var http = require('http');
var net = require('net');
var concatBuffers = require('concat-buffers');
var CRLF = '\r\n';

function U8(str) {
  var u8 = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    u8[i] = str.charCodeAt(i);
  }
  return u8;
}

test('http server get', function(t) {
  t.plan(9);
  var response = new HttpResponse(200, {}, 'ok');
  var server = new HttpServer();

  server.onrequest = request => {
    request.respondWith(response);
  };

  t.on('end', function() {
    server.close();
  });

  server.listen(7777);

  process.nextTick(function() {
    http.get('http://localhost:7777/', function(res) {
      t.equal(res.statusCode, 200);

      res.on('data', function(value) {
        t.equal(value.toString(), 'ok');
      });

      res.on('end', function() {
        t.ok(true);
      });
    });

    http.get('http://localhost:7777/hello', function(res) {
      t.equal(res.statusCode, 200);

      res.on('data', function(value) {
        t.equal(value.toString(), 'ok');
      });

      res.on('end', function() {
        t.ok(true);
      });
    });

    http.get('http://localhost:7777/hello?x=1#tag', function(res) {
      t.equal(res.statusCode, 200);

      res.on('data', function(value) {
        t.equal(value.toString(), 'ok');
      });

      res.on('end', function() {
        t.ok(true);
      });
    });
  });
});

test('http server post request', function(t) {
  t.plan(6);
  var response = new HttpResponse(200, {}, 'ok');
  var server = new HttpServer();

  server.onrequest = request => {
    console.log('request', request.path);
    var chunks = [];

    request.ondata = chunk => {
      t.ok(true, 'request data');
      chunks.push(chunk);
    }

    request.onend = () => {
      t.ok(true, 'request end');

      var b = concatBuffers(chunks);
      var body = String.fromCharCode.apply(null, b);
      t.equal(body, JSON.stringify({ data: 'value' }));

      request.respondWith(response);
    };
  };

  t.on('end', server.close.bind(server));

  server.listen(7777);

  process.nextTick(function() {
    var json = JSON.stringify({
      data: 'value'
    });

    var req = http.request({
      hostname: '127.0.0.1',
      port: 7777,
      path: '/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': json.length
      }
    }, function(res) {
      t.equal(res.statusCode, 200);

      res.on('data', function(buf) {
        t.equal(buf.toString(), 'ok');
      });

      res.on('end', function() {
        t.ok(true, 'http response end');
      });
    });

    req.end(json);
  });
});

test('http pipelining', function(t) {
  t.plan(8);
  var response = new HttpResponse(200, {}, 'ok');
  var server = new HttpServer();

  server.onrequest = request => {
    request.respondWith(response);
  };

  t.on('end', server.close.bind(server));

  server.listen(7777);

  function testInput(input) {
    var socket = net.createConnection(7777, '127.0.0.1', () => {
      socket.write(Buffer(U8(input.join(CRLF))));
      socket.end();
    });

    socket.on('data', (buf) => {
      var s = buf.toString();
      var responsesCount = (s.match(/HTTP\/1.1 200 OK/g) || []).length;
      t.equal(responsesCount, 4);
    });

    socket.on('end', () => {
      t.ok(true, 'done');
    });
  }

  process.nextTick(function() {
    testInput([
      'GET / HTTP/1.1',
      'Request-Id: 1' + CRLF,
      'GET / HTTP/1.1',
      'Request-Id: 2' + CRLF,
      'GET / HTTP/1.1',
      'Request-Id: 3' + CRLF,
      'GET / HTTP/1.1',
      'Request-Id: 4' + CRLF,
      CRLF
    ]);

    testInput([
      'POST / HTTP/1.1',
      'Content-length: 4',
      'Request-Id: 1' + CRLF,
      'testPOST / HTTP/1.1',
      'Content-length: 4',
      'Request-Id: 2' + CRLF,
      'testPOST / HTTP/1.1',
      'Content-length: 4',
      'Request-Id: 3' + CRLF,
      'testPOST / HTTP/1.1',
      'Content-length: 4',
      'Request-Id: 4' + CRLF,
      'test'
    ]);

    testInput([
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 1' + CRLF,
      '4',
      'test',
      '0' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 2' + CRLF,
      '4',
      'test',
      '0' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 3' + CRLF,
      '4',
      'test',
      '0' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 4' + CRLF,
      '4',
      'test',
      '0' + CRLF + CRLF
    ]);

    testInput([
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 1' + CRLF,
      '4',
      'test',
      '0',
      'Trailer: value' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 2' + CRLF,
      '4',
      'test',
      '5',
      'hello',
      '0',
      'Trailer: value' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 3' + CRLF,
      '4',
      'test',
      '6',
      'world!',
      '0',
      'Trailer: value',
      'Trailer2: value2' + CRLF,
      'POST / HTTP/1.1',
      'transfer-Encoding: chunked',
      'Request-Id: 4' + CRLF,
      '4',
      'test',
      '3',
      'abc',
      '3',
      'def',
      '2',
      'kk',
      '0',
      'Trailer: value' + CRLF + CRLF
    ]);
  });
});
