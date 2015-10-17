'use strict';
var backend = require('./backend')();
var date = require('./date');
var HttpConnection = require('./http-connection');
var connections = new Map();

class HttpServer {
  constructor() {
    this.onrequest = function() {};
    this.onclose = function() {};
    this._handle = backend.createServerHandle(this);
  }

  _connectionHandler(socket) {
    connections.set(socket, new HttpConnection(this, socket));
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

  _timeoutTick() {
    for (var conn of connections.values()) {
      conn._timeoutTick();
    }
  }

  _closeHandler(socket) {
    var conn = connections.get(socket);
    if (!conn) {
      return;
    }

    conn._closeHandler();
    connections.delete(socket);
  }

  listen(port) {
    date.ref(this);
    backend.listen(this._handle, port);
  }

  close() {
    date.unref(this);
    backend.unlisten(this._handle);
  }
}

module.exports = HttpServer;
