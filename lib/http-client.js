'use strict';
var backend = require('./backend')();
var HttpResponse = require('./http-response');

var CLIENT_STATE_CLOSED = 0;
var CLIENT_STATE_CONNECTING = 1;
var CLIENT_STATE_CONNECTED = 2;

var QUEUE_ITEM_REQUEST = 0;
var QUEUE_ITEM_DONE = 1;

class HttpClient {
  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
    this._handle = backend.createClientHandle(this);
    this._state = CLIENT_STATE_CLOSED;
    this._requestQueue = [];
    this._requestsSent = 0;
  }

  request(request, cb) {
    var buf = request._getBuffer();
    this._requestQueue.push([buf, cb, new HttpResponse(0, null), QUEUE_ITEM_REQUEST]);
    this._nextRequest();

  }

  close() {
    this._requestQueue.push([null, null, null, QUEUE_ITEM_DONE]);
  }

  _nextRequest() {
    if (this._requestQueue.length === 0) {
      return;
    }

    if (this._requestQueue[0][3] === QUEUE_ITEM_DONE) {
      this._doneHandler();
      return;
    }

    if (this._state === CLIENT_STATE_CONNECTING) {
      return;
    }

    // HTTP/1.1 can handle only one request at a time
    if (this._requestsSent > 0) {
      return;
    }

    if (this._state === CLIENT_STATE_CLOSED) {
      this._state = CLIENT_STATE_CONNECTING;
      backend.connect(this._handle, this._ip, this._port);
      return;
    }

    var request = this._requestQueue[0];
    backend.send(this._handle, request[0]);
  }

  _doneHandler() {
    if (this._state === CLIENT_STATE_CONNECTED) {
      backend.closeClientHandle(this._handle);
    }
  }

  _openHandler() {
    if (this._state === CLIENT_STATE_CONNECTING) {
      this._state = CLIENT_STATE_CONNECTED;
      this._nextRequest();
    }
  }

  _dataHandler(u8) {
    if (this._state !== CLIENT_STATE_CONNECTED) {
      return;
    }

    if (this._requestQueue.length === 0) {
      return;
    }

    var request = this._requestQueue[0];
    var callback = request[1];
    var response = request[2];

    response._chunk(u8);

    if (response._parser._headersReceived) {
      if (callback) {
        callback(null, response);
        request[1] = null;
      }

      if (response.ondata && response._parser._lastBodyChunk) {
        response.ondata(response._parser._lastBodyChunk);
        response._parser._lastBodyChunk = null;
      }
    }

    if (response._parser.isComplete()) {
      this._requestQueue.shift();

      if (response.onend) {
        response.onend();
      }

      this._nextRequest();
    }
  }

  _endHandler() {
  }

  _closeHandler() {
  }
}

module.exports = HttpClient;
