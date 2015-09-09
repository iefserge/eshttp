'use strict';
var HttpParser = require('./http-parser');
var Headers = require('./headers');
var CRLF = '\r\n';

function makeHeader(method, path, headers, body) {
  var header = String(method) + ' ' + String(path) + ' HTTP/1.1' + CRLF;

  if (body) {
    header += 'content-length: ' + String(body.length) + CRLF;
  }

  for (var i = 0, l = headers._names.length; i < l; ++i) {
    header += String(headers._names[i]) + ': ' + String(headers._values[i]) + CRLF;
  }

  if (!body) {
    return header + CRLF;
  }

  return header + CRLF + body + CRLF;
}

function stringToBuffer(str) {
  return new Buffer(str);
}

class HttpRequest {
  constructor(method, path, headers, body, opts) {
    this._method = method;
    this._path = path;
    if (headers instanceof Headers) {
      this._headers = headers;
    } else {
      this._headers = new Headers(headers);
    }
    this._body = body ? body : '';
    this._u8cache = null;
    this._parser = null;
    this._connection = null;
  }

  get method() {
    return this._parser ? this._parser._method : this._method;
  }

  get url() {
    return this._parser ? this._parser._path : this._path;
  }

  get httpVersion() {
    return this._parser._versionMajor + '.' + this._parser._versionMinor;
  }

  get hasBody() {
    return this._parser ? this._parser.hasBody() : true;
  }

  get headers() {
    return this._headers;
  }

  isComplete() {
    return this._parser ? this._parser.isComplete() : true;
  }

  respondWith(response) {
    if (!this._connection) {
      throw new Error('no connection');
    }

    if (this._parser.isKeepAlive()) {
      this._connection._send(response._getBuffer(true));
    } else {
      this._connection._sendAndClose(response._getBuffer(false));
    }
  }

  _chunk(u8) {
    if (!this._parser) {
      this._parser = new HttpParser(true, this._headers);
    }

    this._parser.chunk(u8);
  }

  _getBuffer() {
    if (this._u8cache) {
      return this._u8cache;
    }

    this._u8cache = stringToBuffer(makeHeader(this._method, this._path, this._headers, this._body));
    return this._u8cache;
  }
}

module.exports = HttpRequest;
