'use strict';
var CRLF = '\r\n';
var date = require('./date');
var codes = require('./http-codes');

function statusLine(code) {
  if (code === 200) {
    return 'HTTP/1.1 200 OK';
  }

  var phrase = codes[code] || 'Unknown';
  return 'HTTP/1.1 ' + String(code) + ' ' + String(phrase);
}

function makeHeader(code, headers, bodyLength, isChunked, isKeepAlive) {
  var header = statusLine(code) + CRLF;

  if (isKeepAlive) {
    header += 'connection: keep-alive' + CRLF;
  } else {
    header += 'connection: close' + CRLF;
  }

  // append date header
  header += 'date: ' + date.getDateHeaderString() + CRLF;

  if (isChunked) {
    header += 'transfer-encoding: chunked' + CRLF;
  } else {
    header += 'content-length: ' + String(bodyLength) + CRLF;
  }

  for (var i = 0, l = headers._names.length; i < l; ++i) {
    header += String(headers._names[i]) + ': ' + String(headers._values[i]) + CRLF;
  }

  return header;
}

module.exports = makeHeader;
