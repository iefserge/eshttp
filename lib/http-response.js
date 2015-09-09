'use strict';
var date = require('./date');
var Headers = require('./headers');
var HttpParser = require('./http-parser');

var codes = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported'
};

var CRLF = '\r\n';

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

function stringToBuffer(str) {
  return new Buffer(str);
}

class HTTPResponse {
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
      this._headers, this._body.length, this._chunked, keepAlive) + CRLF + this._body)

    if (keepAlive) {
      this._u8cacheKeepAlive = cachedValue;
    } else {
      this._u8cache = cachedValue;
    }

    return cachedValue;
  }
}

module.exports = HTTPResponse;
