'use strict';
var testCaseParser = require('./test-case-parser');
var CRLF = '\r\n';

// ***************************************************************
// REQUESTS
// **************************************************************

testCaseParser({
  name: 'basic http request',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'Connection: close',
    'Host: localhost:8080',
    'Accept: text/html, text/plain',
    'User-Agent: test',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: false,
    status: 'complete',
    headers: {
      'host': 'localhost:8080',
      'accept': 'text/html, text/plain',
      'user-agent': 'test'
    }
  }
});

testCaseParser(function() {
  function makeTest(method) {
    return {
      name: 'request method ' + method,
      type: 'request',
      input: [
        method + ' / HTTP/1.1',
        'Connection: close',
        CRLF
      ],
      checks: {
        method: method,
        path: '/',
        versionMajor: 1,
        versionMinor: 1,
        chunked: false,
        keepAlive: false,
        status: 'complete',
        headers: {}
      }
    };
  }

  return [
    'OPTIONS',
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
  ].map(makeTest);
});

testCaseParser(function() {
  function makeTest(path) {
    return {
      name: 'request path ' + path,
      type: 'request',
      input: [
        'GET ' + path + ' HTTP/1.1',
        'Connection: close',
        CRLF
      ],
      checks: {
        method: 'GET',
        path: path,
        versionMajor: 1,
        versionMinor: 1,
        chunked: false,
        keepAlive: false,
        status: 'complete',
        headers: {}
      }
    };
  }

  return [
    '/',
    '/hello',
    '/hello-world',
    '/a/b/c/d/e/f/g/h',
    '/some/resource.json?x=hello-world&z=23&token=badsjejfd234j2k',
    '/data/index.html'
  ].map(makeTest);
});

testCaseParser({
  name: 'headers test',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'connection: keep-alive',
    'x-header: ok',
    'other-header: header-value',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'x-header': 'ok',
      'other-header': 'header-value'
    }
  }
});

testCaseParser({
  name: 'header multiline value',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'connection: keep-alive',
    'x-header: hello',
    ' world',
    'other-header: header-value',
    'x-header-2: test',
    '   value',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'x-header': 'hello world',
      'other-header': 'header-value',
      'x-header-2': 'test   value'
    }
  }
});

testCaseParser({
  name: 'header multiline value on the next lines',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'connection: keep-alive',
    'x-header:',
    ' hello',
    ' world',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'x-header': 'hello world'
    }
  }
});

testCaseParser({
  name: 'header multiline value on the next lines and extra spaces',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'connection: keep-alive',
    'x-header:     ',
    '     hello',
    ' world',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'x-header': 'hello world'
    }
  }
});

testCaseParser({
  name: 'http 1.1 keep alive enabled',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'Connection: keep-alive',
    'Host: localhost:8080',
    'User-Agent: test',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'host': 'localhost:8080',
      'user-agent': 'test'
    }
  }
});

testCaseParser({
  name: 'http 1.0 keep alive disabled',
  type: 'request',
  input: [
    'GET / HTTP/1.0',
    'Connection: keep-alive',
    'Host: localhost:8080',
    'User-Agent: test',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 0,
    chunked: false,
    keepAlive: false,
    status: 'complete',
    headers: {
      'host': 'localhost:8080',
      'user-agent': 'test'
    }
  }
});

testCaseParser({
  name: 'http 1.1 no connection header default to keep-alive',
  type: 'request',
  input: [
    'GET / HTTP/1.1',
    'Host: localhost:8080',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {}
  }
});

testCaseParser({
  name: 'http 1.0 no connection header default to close',
  type: 'request',
  input: [
    'GET / HTTP/1.0',
    'Host: localhost:8080',
    CRLF
  ],
  checks: {
    method: 'GET',
    path: '/',
    versionMajor: 1,
    versionMinor: 0,
    chunked: false,
    keepAlive: false,
    status: 'complete',
    headers: {}
  }
});

testCaseParser({
  name: 'http request content length body',
  type: 'request',
  input: [
    'POST /write HTTP/1.0',
    'Server: test',
    'Content-Length: 16' + CRLF,
    'This is the body',
    CRLF
  ],
  checks: {
    method: 'POST',
    path: '/write',
    versionMajor: 1,
    versionMinor: 0,
    chunked: false,
    keepAlive: false,
    status: 'complete',
    body: 'This is the body',
    headers: {
      'server': 'test'
    }
  }
});

testCaseParser({
  name: 'http request chunked',
  type: 'request',
  input: [
    'POST /write HTTP/1.1',
    'Transfer-encoding: chunked',
    'Server: test' + CRLF,
    '5',
    'hello',
    '7',
    ' world!',
    '0',
    CRLF
  ],
  checks: {
    method: 'POST',
    path: '/write',
    versionMajor: 1,
    versionMinor: 1,
    chunked: true,
    keepAlive: true,
    status: 'complete',
    body: 'hello world!',
    headers: {
      'server': 'test'
    }
  }
});

testCaseParser({
  name: 'http request chunked with trailers',
  type: 'request',
  input: [
    'POST /write HTTP/1.1',
    'Transfer-encoding: chunked',
    'Server: test' + CRLF,
    '5',
    'hello',
    '7',
    ' world!',
    '0',
    'Trailer1: value1',
    'Trailer2: value2',
    CRLF
  ],
  checks: {
    method: 'POST',
    path: '/write',
    versionMajor: 1,
    versionMinor: 1,
    chunked: true,
    keepAlive: true,
    status: 'complete',
    body: 'hello world!',
    headers: {
      'server': 'test'
    }
  }
});

testCaseParser(function() {
  var common = {
    name: 'request parse errors',
    type: 'request',
    checks: {
      status: 'error'
    }
  };

  return [
    [
      'VERYLONGREQUESTMETHOD / HTTP/1.1'
    ],
    [
      'hello /'
    ],
    [
      'GET',
      '/hello'
    ],
    [
      'GET /hello',
      'HTTP/1.1'
    ],
    [
      'GET /hello TCP/1.0'
    ],
    [
      'GET /hello H/1.0'
    ],
    [
      'GET /hello HT/1.0'
    ],
    [
      'GET /hello HTT/1.0'
    ],
    [
      'GET /hello HTTP.1.0'
    ],
    [
      'GET /hello HTTP/0.0'
    ],
    [
      'GET /hello HTTP/1.2'
    ],
    [
      'GET /hello HTTP/2.0'
    ],
    [
      'GET /hello HTTP/1',
      '.0'
    ],
    [
      'GET /hello HTTP/1.1',
      'conn',
      'ection: close'
    ],
    [
      'GET /hello HTTP/1.1',
      'conn ection: close'
    ],
    [
      'GET /hello HTTP/1.1',
      '{connection: close'
    ],
    [
      'GET /hello HTTP/1.1',
      ';connection: close'
    ],
    [
      'GET /hello HTTP/1.1',
      'connection : close'
    ],
    [
      'GET /hello HTTP/1.1',
      'conne=ction : close'
    ],
    [
      'GET /hello HTTP/1.1',
      ' world'
    ],
    [
      'GET /hello HTTP/1.1',
      'Header: ' + 'a'.repeat(1024 * 20) // >16 KiB value
    ],
  ].map(function(input) {
    return Object.assign({ input }, common);
  });
});

testCaseParser({
  name: 'http request chunked',
  type: 'request',
  input: [
    'POST /write HTTP/1.1',
    'Transfer-encoding: chunked',
    'Server: test' + CRLF,
    '5',
    'hello',
    '7',
    ' world!',
    '0',
    CRLF
  ],
  checks: {
    method: 'POST',
    path: '/write',
    versionMajor: 1,
    versionMinor: 1,
    chunked: true,
    keepAlive: true,
    status: 'complete',
    body: 'hello world!',
    headers: {
      'server': 'test'
    }
  }
});

// ***************************************************************
// RESPONSES
// **************************************************************

testCaseParser({
  name: 'basic http response',
  type: 'response',
  input: [
    'HTTP/1.1 200 OK',
    'Server: test',
    'X-Header1: value1',
    'X-Header2: value2',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: 'OK',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'server': 'test',
      'x-header1': 'value1',
      'x-header2': 'value2'
    }
  }
});

testCaseParser({
  name: 'http response no messgae',
  type: 'response',
  input: [
    'HTTP/1.1 200',
    'Server: test',
    'X-Header1: value1',
    'X-Header2: value2',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: '',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {
      'server': 'test',
      'x-header1': 'value1',
      'x-header2': 'value2'
    }
  }
});

testCaseParser({
  name: 'http response custom message',
  type: 'response',
  input: [
    'HTTP/1.1 200 Hello World',
    'Server: test',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: 'Hello World',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {}
  }
});

testCaseParser({
  name: 'http response custom code',
  type: 'response',
  input: [
    'HTTP/1.1 707 Who am I?',
    'Server: test',
    CRLF
  ],
  checks: {
    statusCode: 707,
    statusMessage: 'Who am I?',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    headers: {}
  }
});

testCaseParser({
  name: 'http response content length body',
  type: 'response',
  input: [
    'HTTP/1.1 200 OK',
    'Server: test',
    'Content-Length: 16' + CRLF,
    'This is the body',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: 'OK',
    versionMajor: 1,
    versionMinor: 1,
    chunked: false,
    keepAlive: true,
    status: 'complete',
    body: 'This is the body',
    headers: {}
  }
});

testCaseParser({
  name: 'http response chunked',
  type: 'response',
  input: [
    'HTTP/1.1 200 OK',
    'Transfer-encoding: chunked',
    'Server: test' + CRLF,
    '5',
    'hello',
    '7',
    ' world!',
    '0',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: 'OK',
    versionMajor: 1,
    versionMinor: 1,
    chunked: true,
    keepAlive: true,
    status: 'complete',
    body: 'hello world!',
    headers: {
      'server': 'test'
    }
  }
});

testCaseParser({
  name: 'http response chunked empty body',
  type: 'response',
  input: [
    'HTTP/1.1 200 OK',
    'Transfer-encoding: chunked',
    'Server: test' + CRLF,
    '0',
    CRLF
  ],
  checks: {
    statusCode: 200,
    statusMessage: 'OK',
    versionMajor: 1,
    versionMinor: 1,
    chunked: true,
    keepAlive: true,
    status: 'complete',
    body: '',
    headers: {
      'server': 'test'
    }
  }
});
