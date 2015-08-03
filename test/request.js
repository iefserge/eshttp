'use strict';
var test = require('tape');
var HTTPRequest = require('../lib/http-request');
var CRLF = '\r\n';

function U8(str) {
  var u8 = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    u8[i] = str.charCodeAt(i);
  }
  return u8;
}

test('basic http request', function(t) {
  var request = new HTTPRequest();

  var data = [
    'GET / HTTP/1.1',
    'Connection: close',
    'Host: localhost:8080',
    'Accept: text/html, text/plain',
    'User-Agent: test',
    CRLF
  ].join(CRLF);

  request._chunk(U8(data));
  t.equal(request.method, 'GET');
  t.equal(request.url, '/');
  t.equal(request.httpVersion, '1.1');
  t.equal(request.headers.get('connection'), 'close');
  t.equal(request.headers.get('accept'), 'text/html, text/plain');
  t.equal(request.headers.get('user-agent'), 'test');
  t.ok(request.isComplete())
  console.log(request);
  t.end();
});

test('http request 1 byte buffer chunks', function(t) {
  var request = new HTTPRequest();

  var data = [
    'GET / HTTP/1.1',
    'Connection: close',
    'Host: localhost:8080',
    'Accept: text/html, text/plain',
    'User-Agent: test',
    CRLF
  ].join(CRLF);

  var u8 = U8(data);
  for (var i = 0; i < u8.length; ++i) {
    request._chunk(u8.subarray(i, i + 1));
    if (i === u8.length - 1) {
      t.ok(request.isComplete())
    } else {
      t.ok(!request.isComplete())
    }
  }

  t.equal(request.method, 'GET');
  t.equal(request.url, '/');
  t.equal(request.httpVersion, '1.1');
  t.equal(request.headers.get('connection'), 'close');
  t.equal(request.headers.get('accept'), 'text/html, text/plain');
  t.equal(request.headers.get('user-agent'), 'test');
  t.ok(request.isComplete())
  t.end();
});

function testMethod(method) {
  test('method ' + method, function(t) {
    var request = new HTTPRequest();

    var data = [
      method + ' / HTTP/1.1',
      'Connection: close',
      CRLF
    ].join(CRLF);
    request._chunk(U8(data));

    t.equal(request.method, method, 'method is valid');
    t.equal(request.url, '/', 'url is valid');
    t.equal(request.httpVersion, '1.1', 'http version is valid');
    t.ok(request.isComplete(), 'request is complete');
    t.end();
  });
}

[ 'OPTIONS',
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'TRACE',
  'PATCH',
  'PURGE',
  'REPORT',
  'MKACTIVITY',
  'CHECKOUT',
  'MERGE',
  'COPY',
  'MOVE',
  'LOCK',
  'UNLOCK',
  'MKCOL',
  'PROPPATCH',
  'PROPFIND',
  'SEARCH'
].forEach(testMethod);

function testURL(url) {
  test('url ' + url, function(t) {
    var request = new HTTPRequest();

    var data = [
      'GET ' + url + ' HTTP/1.1',
      'Connection: close',
      CRLF
    ].join(CRLF);
    request._chunk(U8(data));

    t.equal(request.method, 'GET', 'method is valid');
    t.equal(request.url, url, 'url is valid');
    t.equal(request.httpVersion, '1.1', 'http version is valid');
    t.ok(request.isComplete(), 'request is complete');
    t.end();
  });
}

[ '/',
  '/hello',
  '/hello-world',
  '/a/b/c/d/e/f/g/h',
  '/some/resource.json?x=hello-world&z=23&token=badsjejfd234j2k',
  '/data/index.html'
].forEach(testURL);

test('test headers', function(t) {
  var request = new HTTPRequest();
  var data = [
    'GET / HTTP/1.1',
    'connection: keep-alive',
    'x-header: ok',
    'other-header: header-value',
    CRLF
  ].join(CRLF);
  request._chunk(U8(data));

  t.equal(request.method, 'GET', 'method is valid');
  t.equal(request.url, '/', 'url is valid');
  t.equal(request.httpVersion, '1.1', 'http version is valid');
  t.equal(request.headers.get('connection'), 'keep-alive');
  t.equal(request.headers.get('x-header'), 'ok');
  t.equal(request.headers.get('other-header'), 'header-value');
  t.ok(request.isComplete(), 'request is complete');
  t.end();
});
