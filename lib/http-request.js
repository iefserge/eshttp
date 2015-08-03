'use strict';
var Headers = require('./headers');
var tokens = require('./tokens');
var isValidMethodCharCode = tokens.isValidMethodCharCode;

var PARSER_STATE_METHOD = 0;
var PARSER_STATE_URL = 1;
var PARSER_STATE_PROTOCOL = 2;
var PARSER_STATE_PROTOCOL_H = 3;
var PARSER_STATE_PROTOCOL_HT = 4;
var PARSER_STATE_PROTOCOL_HTT = 5;
var PARSER_STATE_PROTOCOL_HTTP = 6;
var PARSER_STATE_PROTOCOL_SLASH = 7;
var PARSER_STATE_VERSION_MAJOR = 8;
var PARSER_STATE_VERSION_DOT = 9;
var PARSER_STATE_VERSION_MINOR = 10;
var PARSER_STATE_HTTP_HEADERS = 11;
var PARSER_STATE_HTTP_HEADER_KEY = 12;
var PARSER_STATE_HTTP_HEADER_VALUE = 13;
var PARSER_STATE_BODY = 14;
var PARSER_STATE_DONE = 15;

class HTTPRequest {
  constructor() {
    this.method = '';
    this.url = '';
    this._versionMajor = 0;
    this._versionMinor = 0;
    this._state = PARSER_STATE_METHOD;
    this._tokenPosition = 0;
    this._error = false;
    this._tmpStringKey = '';
    this._tmpStringValue = '';
    this._headersReceived = false;
    this._isChunked = false;
    this._contentLength = 0;
    this._hasBody = false;
    this._connection = null;
    this.headers = new Headers();
  }

  get httpVersion() {
    return this._versionMajor + '.' + this._versionMinor;
  }

  get hasBody() {
    return this._hasBody;
  }

  isComplete() {
    return this._state === PARSER_STATE_DONE;
  }

  respondWith(response) {
    if (!this._connection) {
      throw new Error('no connection');
    }

    this._connection._sendAndClose(response._getBuffer());
  }

  _error() {
    this._error = true;
  }

  _addHeader(name, value) {
    name = name.toLowerCase();
    value = value.trimRight();

    // RFC2616 (section 4.3)
    // the presence of a message-body is signaled by the inclusion
    // of a Content-Length or Transfer-Encoding header
    switch (name) {
    case 'content-length':
      this._contentLength = Number(value);
      this._hasBody = true;
      return;
    case 'transfer-encoding':
      this._isChunked = value.indexOf('chunked') >= 0;
      this._hasBody = true;
      return;
    }

    // push directly into private state to avoid possible validation
    this.headers._names.push(name);
    this.headers._values.push(value);
  }

  _chunk(u8) {
    for (var i = 0, l = u8.length; i < l; ++i) {
      var c = String.fromCharCode(u8[i]);

      if (c === '\r') {
        continue;
      }

      switch (this._state) {
      case PARSER_STATE_METHOD:
        if (c === ' ') {
          this._state = PARSER_STATE_URL;
          continue;
        }

        if (this.method.length < 10 && isValidMethodCharCode(u8[i])) {
          this.method += c;
        } else {
          this._error();
          return;
        }
        break;
      case PARSER_STATE_URL:
        if (c === ' ') {
          this._state = PARSER_STATE_PROTOCOL;
          this._tokenPosition = 0;
          continue;
        }

        this.url += c;
        break;
      case PARSER_STATE_PROTOCOL:
        if (c === 'H') {
          this._state = PARSER_STATE_PROTOCOL_H;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PROTOCOL_H:
        if (c === 'T') {
          this._state = PARSER_STATE_PROTOCOL_HT;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PROTOCOL_HT:
        if (c === 'T') {
          this._state = PARSER_STATE_PROTOCOL_HTT;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PROTOCOL_HTT:
        if (c === 'P') {
          this._state = PARSER_STATE_PROTOCOL_HTTP;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PROTOCOL_HTTP:
        if (c === '/') {
          this._state = PARSER_STATE_PROTOCOL_SLASH;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PROTOCOL_SLASH:
        if (c === '1') {
          this._state = PARSER_STATE_VERSION_MAJOR;
          this._versionMajor = c | 0;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_VERSION_MAJOR:
        if (c === '.') {
          this._state = PARSER_STATE_VERSION_DOT;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_VERSION_DOT:
        if (c === '0' || c === '1') {
          this._state = PARSER_STATE_VERSION_MINOR;
          this._versionMinor = c | 0;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_VERSION_MINOR:
        if (c === '\n') {
          this._state = PARSER_STATE_HTTP_HEADERS;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_HTTP_HEADERS:
        if (c === '\n') {
          this._headersReceived = true;
          if (this._hasBody) {
            this._state = PARSER_STATE_BODY;
          } else {
            this._state = PARSER_STATE_DONE;
          }
          continue;
        }

        this._tmpStringKey = c;
        this._state = PARSER_STATE_HTTP_HEADER_KEY;
        break;
      case PARSER_STATE_HTTP_HEADER_KEY:
        if (c === ':') {
          this._state = PARSER_STATE_HTTP_HEADER_VALUE;
          this._tmpStringValue = '';
          continue;
        }

        this._tmpStringKey += c;
        break;
      case PARSER_STATE_HTTP_HEADER_VALUE:
        if (c === '\n') {
          this._state = PARSER_STATE_HTTP_HEADERS;
          this._addHeader(this._tmpStringKey, this._tmpStringValue);
          continue;
        }

        // skip spaces before header value
        // "x-header:   value" => "x-header" = "value"
        if (c === ' ' && this._tmpStringValue.length === 0) {
          continue;
        }

        this._tmpStringValue += c;
        break;
      }
    }
  }
}

module.exports = HTTPRequest;
