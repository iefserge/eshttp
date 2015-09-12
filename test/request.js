'use strict';
var test = require('tape');
var HttpRequest = require('../lib/http-request');

test('http request instance', function(t) {
  var request = new HttpRequest('GET', '/', { 'x-header': 'value' });
  t.equal(request.method, 'GET');
  t.equal(request.path, '/');
  t.ok(request.headers.has('X-HEADER'));
  t.equal(request.headers.get('X-HEADER'), 'value');
  t.end();
});
