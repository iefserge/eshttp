'use strict';
var Headers = require('./headers');
var tokens = require('./tokens');
var isValidMethodCharCode = tokens.isValidMethodCharCode;
var isValidCharCode = tokens.isValidCharCode;

const PARSER_MAX_HEADERS_LENGTH = 1024 * 16; /* 16 KiB */

var PARSER_STATE_METHOD = 0;
var PARSER_STATE_PATH = 1;
var PARSER_STATE_PROTOCOL = 2;
var PARSER_STATE_PROTOCOL_H = 3;
var PARSER_STATE_PROTOCOL_HT = 4;
var PARSER_STATE_PROTOCOL_HTT = 5;
var PARSER_STATE_PROTOCOL_HTTP = 6;
var PARSER_STATE_PROTOCOL_SLASH = 7;
var PARSER_STATE_VERSION_MAJOR = 8;
var PARSER_STATE_VERSION_DOT = 9;
var PARSER_STATE_VERSION_MINOR = 10;
var PARSER_STATE_CODE_1 = 11;
var PARSER_STATE_CODE_2 = 12;
var PARSER_STATE_CODE_3 = 13;
var PARSER_STATE_CODE_SPACE = 14;
var PARSER_STATE_PHRASE = 15;
var PARSER_STATE_HTTP_HEADERS = 16;
var PARSER_STATE_HTTP_HEADER_KEY = 17;
var PARSER_STATE_HTTP_HEADER_VALUE = 18;
var PARSER_STATE_BODY_CHUNK = 19;
var PARSER_STATE_BODY_CHUNK_SIZE = 20;
var PARSER_STATE_BODY_CHUNK_NEXT = 21;
var PARSER_STATE_DONE = 22;
var PARSER_STATE_ERROR = 23;

var HTTP_CONNECTION_CLOSE = 0;
var HTTP_CONNECTION_KEEP_ALIVE = 1;

class HttpParser {
  constructor(isRequest, headers) {
    this._isRequest = isRequest;
    this._method = '';
    this._path = '';
    this._versionMajor = 0;
    this._versionMinor = 0;
    this._state = isRequest ? PARSER_STATE_METHOD : PARSER_STATE_PROTOCOL;
    this._code = 0;
    this._phrase = '';
    this._tmpStringKey = '';
    this._tmpStringValue = '';
    this._headersReceived = false;
    this._hasBody = false;
    this._lastParsedIndex = 0;
    this._chunkLength = 0;
    this._isChunked = false;
    this._lastBodyChunk = null;
    this._headersLength = 0;
    this._connection = HTTP_CONNECTION_KEEP_ALIVE;
    this.headers = headers ? headers : new Headers();
    this.onbodychunk = null;
  }

  get path() { return this._path; }
  get method() { return this._method; }
  get versionMajor() { return this._versionMajor; }
  get versionMinor() { return this._versionMinor; }
  get statusCode() { return this._code; }
  get statusMessage() { return this._phrase; }
  get lastBodyChunk() { return this._lastBodyChunk; }
  get headersReceived() { return this._headersReceived; }
  get lastParsedIndex() { return this._lastParsedIndex; }

  hasBody() {
    return this._hasBody;
  }

  _error() {
    this._state = PARSER_STATE_ERROR;
  }

  _addHeader(name, value) {
    name = name.toLowerCase();
    value = value.trimRight();

    // RFC2616 (section 4.3)
    // the presence of a message-body is signaled by the inclusion
    // of a Content-Length or Transfer-Encoding header
    switch (name) {
    case 'content-length':
      this._chunkLength = Number(value);
      this._hasBody = true;
      return;
    case 'transfer-encoding':
      this._isChunked = value.indexOf('chunked') >= 0;
      this._hasBody = true;
      return;
    case 'connection':
      if (value === 'close') {
        this._connection = HTTP_CONNECTION_CLOSE;
      }
      return;
    }

    // push directly into private state to avoid possible validation
    this.headers._names.push(name);
    this.headers._values.push(value);
  }

  isComplete() {
    return this._state === PARSER_STATE_DONE;
  }

  isKeepAlive() {
    return this._connection === HTTP_CONNECTION_KEEP_ALIVE;
  }

  isChunked() {
    return this._isChunked;
  }

  isError() {
    return this._state === PARSER_STATE_ERROR;
  }

  chunk(u8) {
    for (var i = 0, l = u8.length; i < l; ++i) {
      var c = String.fromCharCode(u8[i]);

      if (!this._headersReceived && ++this._headersLength > PARSER_MAX_HEADERS_LENGTH) {
        this._error();
        return;
      }

      if (c === '\r') {
        continue;
      }

      switch (this._state) {
      case PARSER_STATE_METHOD:
        // allow any number of newlines before the request method
        if (c === '\n') {
          continue;
        }

        if (c === ' ') {
          this._state = PARSER_STATE_PATH;
          continue;
        }

        if (this._method.length < 10 && isValidMethodCharCode(u8[i])) {
          this._method += c;
        } else {
          this._error();
          return;
        }
        continue;
      case PARSER_STATE_PATH:
        if (c === ' ') {
          this._state = PARSER_STATE_PROTOCOL;
          this._tokenPosition = 0;
          continue;
        }

        if (c === '\n') {
          this._error();
          return;
        }

        this._path += c;
        continue;
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

          // HTTP/1.0 defaults to connection: close
          if (this._versionMajor === 1 && this._versionMinor === 0) {
            this._connection = HTTP_CONNECTION_CLOSE;
          }

          continue;
        }
        this._error();
        return;
      case PARSER_STATE_VERSION_MINOR:
        if (this._isRequest) {
          if (c === '\n') {
            this._state = PARSER_STATE_HTTP_HEADERS;
            continue;
          }
        } else {
          if (c === ' ') {
            this._state = PARSER_STATE_CODE_1;
            continue;
          }
        }
        this._error();
        return;
      case PARSER_STATE_CODE_1:
        this._code = Number(c) * 100;
        this._state = PARSER_STATE_CODE_2;
        continue;
      case PARSER_STATE_CODE_2:
        this._code += Number(c) * 10;
        this._state = PARSER_STATE_CODE_3;
        continue;
      case PARSER_STATE_CODE_3:
        this._code += Number(c);
        this._state = PARSER_STATE_CODE_SPACE;
        continue;
      case PARSER_STATE_CODE_SPACE:
        if (c === ' ') {
          this._state = PARSER_STATE_PHRASE;
          continue;
        }
        // response phrase is optional
        if (c === '\n') {
          this._state = PARSER_STATE_HTTP_HEADERS;
          continue;
        }
        this._error();
        return;
      case PARSER_STATE_PHRASE:
        if (c === '\n') {
          this._state = PARSER_STATE_HTTP_HEADERS;
          continue;
        }
        this._phrase += c;
        break;
      case PARSER_STATE_HTTP_HEADERS:
        if (c === '\n') {
          if (this._tmpStringKey) {
            this._addHeader(this._tmpStringKey, this._tmpStringValue);
          }
          this._headersReceived = true;
          if (this._hasBody) {
            this._state = this._isChunked ? PARSER_STATE_BODY_CHUNK_SIZE : PARSER_STATE_BODY_CHUNK;
            this._tmpStringKey = '';
          } else {
            this._state = PARSER_STATE_DONE;
            this._lastParsedIndex = i;
            return;
          }
          continue;
        }

        // multiline header value
        if (c === ' ') {
          if (this._tmpStringKey === '') {
            this._error();
            return;
          }

          if (this._tmpStringValue.length > 0) {
            this._tmpStringValue += c;
          }

          this._state = PARSER_STATE_HTTP_HEADER_VALUE;
          continue;
        }

        if (!isValidCharCode(u8[i])) {
          this._error();
          return;
        }

        if (this._tmpStringKey) {
          this._addHeader(this._tmpStringKey, this._tmpStringValue);
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

        if (!isValidCharCode(u8[i])) {
          this._error();
          return;
        }

        this._tmpStringKey += c;
        break;
      case PARSER_STATE_HTTP_HEADER_VALUE:
        if (c === '\n') {
          this._state = PARSER_STATE_HTTP_HEADERS;
          continue;
        }

        // skip spaces before header value
        // "x-header:   value" => "x-header" = "value"
        if (c === ' ' && this._tmpStringValue.length === 0) {
          continue;
        }

        this._tmpStringValue += c;
        break;
      case PARSER_STATE_BODY_CHUNK:
        this._lastBodyChunk = u8.subarray(i, Math.min(i + this._chunkLength, u8.length));
        if (this.onbodychunk) {
          this.onbodychunk(this._lastBodyChunk);
        }
        this._chunkLength -= this._lastBodyChunk.length;
        i += this._lastBodyChunk.length;
        if (this._chunkLength === 0) {
          this._state = this._isChunked ? PARSER_STATE_BODY_CHUNK_NEXT : PARSER_STATE_DONE;
          this._lastParsedIndex = i;
          this._tmpStringKey = '';
          if (this._state === PARSER_STATE_DONE) {
            return;
          }
        } else {
          return;
        }
        continue;
      case PARSER_STATE_BODY_CHUNK_SIZE:
        if (c === '\n') {
          this._chunkLength = Number(this._tmpStringKey);
          if (this._chunkLength === 0) {
            this._state = PARSER_STATE_DONE;
            this._lastParsedIndex = i;
            return;
          } else {
            this._state = PARSER_STATE_BODY_CHUNK;
          }
          continue;
        }
        this._tmpStringKey += c;
        break;
      case PARSER_STATE_BODY_CHUNK_NEXT:
        if (c === '\n') {
          this._state = PARSER_STATE_BODY_CHUNK_SIZE;
          continue;
        }
        this._error();
        return;
        break;
      }
    }
  }
}

module.exports = HttpParser;
