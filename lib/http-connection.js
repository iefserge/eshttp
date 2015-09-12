'use strict';
var backend = require('./backend')();
var HttpRequest = require('./http-request');

class HttpConnection {
  constructor(server, socket) {
    this._server = server;
    this._socket = socket;
    this._request = new HttpRequest('', '', null);
    this._request._connection = this;
    this._requestHandled = false;
    this._done = false;
  }

  _dataHandler(u8) {
    if (this._done) {
      return;
    }

    while (true) {
      this._request._chunk(u8);

      if (this._request._parser.isError()) {
        backend.close(this._socket);
        return;
      }

      if (!this._requestHandled && this._request._parser.headersReceived) {
        this._requestHandled = true;
        this._server.onrequest(this._request);
      }

      if (this._request.isComplete()) {
        let lastIndex = this._request._parser.lastParsedIndex;
        this._request = new HttpRequest('', '', null);
        this._request._connection = this;
        this._requestHandled = false;

        if (lastIndex < u8.length - 1) {
          let lastLength = u8.length;
          u8 = u8.subarray(lastIndex + 1);

          // make sure the new buffer is smaller
          if (u8.length >= lastLength) {
            backend.close(this._socket);
            return;
          }

          continue;
        }
      }

      break;
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
