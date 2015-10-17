'use strict';
var backend = require('./backend')();
var HttpRequest = require('./http-request');

class HttpConnection {
  constructor(server, socket) {
    this._server = server;
    this._socket = socket;
    this._request = new HttpRequest('', '', null);
    this._request._connection = this;
    this._request._setupParser();
    this._requestHandled = false;
    this._done = false;
    this._timeoutTicks = 0;
  }

  _timeoutTick() {
    if (this._done) {
      return;
    }

    if (++this._timeoutTicks > 4) {
      this._done = true;
      backend.close(this._socket);
    }
  }

  _dataHandler(u8) {
    if (this._done) {
      return;
    }

    this._timeoutTicks = 0;

    var offset = 0;
    while (offset < u8.length) {
      this._request._chunk(u8, offset);
      offset = this._request._parser.lastParsedIndex + 1;

      if (this._request._parser.isError()) {
        this._done = true;
        backend.close(this._socket);
        return;
      }

      if (!this._requestHandled && this._request._parser.headersReceived) {
        this._requestHandled = true;
        this._server.onrequest(this._request);
      } else {
        var lastChunk = this._request._parser.lastBodyChunk;
        if (lastChunk && this._request.ondata) {
          this._request.ondata(lastChunk);
        }
      }

      if (this._request.isComplete()) {
        if (this._request.onend) {
          this._request.onend();
        }
        this._request._sendResponse();
        this._request = new HttpRequest('', '', null);
        this._request._connection = this;
        this._request._setupParser();
        this._requestHandled = false;
      }
    }
  }

  _endHandler() {
  }

  _closeHandler() {
  }

  _sendAndClose(u8) {
    this._done = true;
    backend.sendAndClose(this._socket, u8);
  }

  _send(u8) {
    backend.send(this._socket, u8);
  }
}

module.exports = HttpConnection;
