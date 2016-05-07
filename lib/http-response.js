'use strict';
const backend = require('./backend')();
const date = require('./date');
const Headers = require('./headers');
const HttpParser = require('./http-parser');
const codes = require('./http-codes');
const makeHeader = require('./response-header');
const stringToSocketData = backend.stringToSocketData;
const CRLF = '\r\n';

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

  get trailers() {
    return this._parser ? this._parser.trailers : new Headers();
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
    let cachedValue = keepAlive ? this._u8cacheKeepAlive : this._u8cache;
    const dateValue = date.getDateValue();
    if (cachedValue && this._u8cacheDate === dateValue) {
      return cachedValue;
    }

    // recreate headers every time for the date header
    this._u8cacheDate = dateValue;
    cachedValue = stringToSocketData(makeHeader(this._code,
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
