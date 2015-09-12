'use strict';
var backend = require('./backend')();
var date = require('./date');
var Headers = require('./headers');
var HttpParser = require('./http-parser');
var codes = require('./http-codes');
var makeHeader = require('./response-header');
var stringToBuffer = backend.stringToBuffer;
var CRLF = '\r\n';

class HttpResponse {
  constructor(code, headers, body, opts) {
    this._code = code | 0;
    this._headers = null;
    if (headers instanceof Headers) {
      this._headers = headers;
    } else {
      this._headers = new Headers(headers);
    }
    this._body = body;
    this._chunked = body === void 0 || body === null;
    this._opts = opts;

    // transmit buffer cache
    this._u8cache = null;
    this._u8cacheKeepAlive = null;
    this._u8cacheDate = 0;

    // client response
    this._parser = null;
    this.ondata = null;
    this.onend = null;
  }

  get statusCode() {
    return this._parser ? this._parser._code : this._code;
  }

  get statusMessage() {
    if (this._parser) {
      return this._parser._phrase;
    }

    return codes[this._code] || 'Unknown';
  }

  _chunk(u8) {
    if (!this._parser) {
      this._parser = new HttpParser(false, this._headers);
    }

    this._parser.chunk(u8);
  }

  _getBuffer(keepAlive) {
    var cachedValue = keepAlive ? this._u8cacheKeepAlive : this._u8cache;
    var dateValue = date.getDateValue();
    if (cachedValue && this._u8cacheDate === dateValue) {
      return cachedValue;
    }

    // recreate headers every time for the date header
    this._u8cacheDate = dateValue;
    cachedValue = stringToBuffer(makeHeader(this._code,
      this._headers, this._body.length, this._chunked, keepAlive) + CRLF + this._body);

    if (keepAlive) {
      this._u8cacheKeepAlive = cachedValue;
    } else {
      this._u8cache = cachedValue;
    }

    return cachedValue;
  }
}

module.exports = HttpResponse;
