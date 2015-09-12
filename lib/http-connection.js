'use strict';
var backend = require('./backend')();
var HttpRequest = require('./http-request');

class HttpConnection {
  constructor(server, socket) {
    this._server = server;
    this._socket = socket;
    this._request = new HttpRequest('', '', null);
    this._request._connection = this;
    this._done = false;
  }

  _dataHandler(u8) {
    if (this._done) {
      return;
    }

    this._request._chunk(u8);

    if (this._request.isComplete()) {
      this._server.onrequest(this._request);
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
