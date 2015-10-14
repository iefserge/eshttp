'use strict';
var test = require('tape');
var concatBuffers = require('concat-buffers');
var HttpParser = require('../lib/http-parser');
var CRLF = '\r\n';

function U8(str) {
  var u8 = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    u8[i] = str.charCodeAt(i);
  }
  return u8;
}

function getRequestParser() {
  return new HttpParser(true);
}

function getResponseParser() {
  return new HttpParser(false);
}

function runTestCase(currentTest) {
  test(currentTest.name, function(t) {
    var checks = currentTest.checks;

    function getParser() {
      return currentTest.type === 'request'
        ? getRequestParser() : getResponseParser();
    }

    function runChecks(parser, bodyChunks, prefix) {
      if ('statusCode' in checks) {
        t.equal(checks.statusCode, parser.statusCode, prefix + ' status code ok');
      }
      if ('statusMessage' in checks) {
        t.equal(checks.statusMessage, parser.statusMessage, prefix + ' status message ok');
      }
      if ('method' in checks) {
        t.equal(checks.method, parser.method, prefix + ' method ok');
      }
      if ('path' in checks) {
        t.equal(checks.path, parser.path, prefix + ' path ok');
      }
      if ('versionMajor' in checks) {
        t.equal(checks.versionMajor, parser.versionMajor, prefix + ' major version ok');
      }
      if ('versionMinor' in checks) {
        t.equal(checks.versionMinor, parser.versionMinor, prefix + ' minor version ok');
      }
      if ('chunked' in checks) {
        t.equal(checks.chunked, parser.isChunked(), prefix + ' chunked flag ok');
      }
      if ('keepAlive' in checks) {
        t.equal(checks.keepAlive, parser.isKeepAlive(), prefix + ' keep-alive flag ok');
      }
      if ('headers' in checks) {
        for (let key in checks.headers) {
          if (!checks.headers.hasOwnProperty(key)) {
            continue;
          }

          t.ok(parser.headers.has(key), prefix + ' has header "' + key + '"');
          t.equal(parser.headers.get(key), checks.headers[key], prefix + ' header value ok "' + key + '"');
        }
      }
      if ('body' in checks) {
        t.deepEqual(concatBuffers(bodyChunks), U8(checks.body), prefix + ' body ok');
      }
      if ('trailers' in checks) {
        for (let key in checks.trailers) {
          if (!checks.trailers.hasOwnProperty(key)) {
            continue;
          }

          t.ok(parser.trailers.has(key), prefix + ' has trailer "' + key + '"');
          t.equal(parser.trailers.get(key), checks.trailers[key], prefix + ' header value ok "' + key + '"');
        }
      }

      var status = checks.status || 'complete';

      if (status === 'complete') {
        t.ok(parser.isComplete(), prefix + ' input complete');
      }

      if (status === 'error') {
        t.ok(parser.isError(), prefix + ' input error');
      }
    }

    {
      let bodyChunks = [];
      let parser = getParser();
      let offset = 0;
      let u8 = U8(currentTest.input.join(CRLF));
      while (offset < u8.length) {
        parser.chunk(u8, offset);
        if (parser.isError()) {
          break;
        }

        if (parser.lastBodyChunk) {
          bodyChunks.push(parser.lastBodyChunk);
        }

        if (offset < parser.lastParsedIndex + 1) {
          offset = parser.lastParsedIndex + 1;
          continue;
        }

        break;
      }

      runChecks(parser, bodyChunks, 'single packet');
    }


    {
      let bodyChunks = [];
      let parser = getParser();
      let u8 = U8(currentTest.input.join(CRLF));
      for (let i = 0; i < u8.length; ++i) {
        let subu8 = u8.subarray(i, i + 1);
        let offset = 0;
        while (offset < subu8.length) {
          parser.chunk(subu8, offset);
          if (parser.isError()) {
            break;
          }

          if (parser.lastBodyChunk) {
            bodyChunks.push(parser.lastBodyChunk);
          }

          if (offset < parser.lastParsedIndex + 1) {
            offset = parser.lastParsedIndex + 1;
            continue;
          }

          break;
        }
      }
      runChecks(parser, bodyChunks, 'split into 1 byte packets');
    }

    t.end();
  });
}

function runTestCases(list) {
  for (let currentTest of list) {
    testCase(currentTest);
  }
}

function testCase(currentTest) {
  if (typeof currentTest === 'function') {
    runTestCases(currentTest());
  } else {
    runTestCase(currentTest);
  }
}

module.exports = testCase;
