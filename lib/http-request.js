'use strict';
var HttpParser = require('./http-parser');
var HttpResponse = require('./http-response');
var Headers = require('./headers');
var concatBuffers = require('concat-buffers');
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
    // this._bodyChunks = [];
    this._response = null;
    this._responseSent = false;
    this.ondata = null;
    this.onend = null;
  }

  // arrayBuffer(cb) {
  //   this.ondata = function(chunk) {
  //     this._bodyChunks.push(chunk);
  //   };
  //   this.onend = function() {
  //     cb(concatBuffers(this._bodyChunks));
  //   };
  // }
  //
  // text() {
  //   this.ondata = function(chunk) {
  //     this._bodyChunks.push(chunk);
  //   };
  //   this.onend = function() {
  //     var decoder = new TextDecoder('utf-8');
  //     cb(decoder.decode(concatBuffers(this._bodyChunks)));
  //   };
  // }

  get method() {
    return this._parser ? this._parser._method : this._method;
  }

  get path() {
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

  respondWith(response, a, b) {
    if (!this._connection || !this._parser) {
      throw new Error('no connection');
    }

    if (this._response) {
      throw new Error('response has already been sent');
    }

    if (typeof response === 'number') {
      this._response = new HttpResponse(response, a, b);
    } else {
      this._response = response;
    }

    if (this._parser.isComplete()) {
      this._sendResponse();
    }
  }

  _sendResponse() {
    if (this._responseSent || !this._response) {
      return;
    }

    this._responseSent = true;
    if (this._parser.isKeepAlive()) {
      this._connection._send(this._response._getBuffer(true));
    } else {
      this._connection._sendAndClose(this._response._getBuffer(false));
    }
  }

  _setupParser() {
    this._parser = new HttpParser(true, this._headers);
  }

  _chunk(u8, offset) {
    this._parser.chunk(u8, offset);
  }

  _getBuffer() {
    if (this._u8cache) {
      return this._u8cache;
    }

    this._u8cache = stringToBuffer(makeHeader(this._method, this._path, this._headers, this._body));
    return this._u8cache;
  }

  toString() {
    return makeHeader(this._method, this._path, this._headers, this._body);
  }
}

module.exports = HttpRequest;
