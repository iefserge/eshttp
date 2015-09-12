'use strict';
var test = require('tape');
var HttpServer = require('../lib/http-server');
var HttpResponse = require('../lib/http-response');
var http = require('http');

test('http server', function(t) {
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
