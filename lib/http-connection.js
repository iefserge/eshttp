'use strict';
var backend = require('./backend')();
var HTTPRequest = require('./http-request');

class HTTPConnection {
  constructor(server, socket) {
    this._server = server;
    this._socket = socket;
    this._request = new HTTPRequest();
    this._request._connection = this;
  }

  _dataHandler(u8) {
    this._request._chunk(u8);

    if (this._request.isComplete()) {
      this._server.onrequest(this._request);
    }
  }

  _endHandler() {
  }

  _sendAndClose(u8) {
    backend.sendAndClose(this._socket, u8);
  }
}

module.exports = HTTPConnection;
