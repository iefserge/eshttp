'use strict';
var backend = require('./backend')();
var HTTPConnection = require('./http-connection');
var connections = new WeakMap();

class HTTPServer {
  constructor() {
    this.onrequest = function() {};
    this.onclose = function() {};
    this._handle = backend.createServerHandle(this);
  }

  _connectionHandler(socket) {
    connections.set(socket, new HTTPConnection(this, socket));
  }

  _dataHandler(socket, u8) {
    var conn = connections.get(socket);
    if (!conn) {
      return;
    }

    conn._dataHandler(u8);
  }

  _endHandler(socket) {
    var conn = connections.get(socket);
    if (!conn) {
      return;
    }

    conn._endHandler();
  }

  listen(port) {
    backend.listen(this._handle, port);
  }

  close() {
    backend.unlisten(this._handle);
  }
}

module.exports = HTTPServer;
