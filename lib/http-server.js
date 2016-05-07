'use strict';
const backend = require('./backend')();
const date = require('./date');
const HttpConnection = require('./http-connection');
const connections = new Map();

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
    const conn = connections.get(socket);
    if (!conn) {
      return;
    }

    conn._dataHandler(u8);
  }

  _endHandler(socket) {
    const conn = connections.get(socket);
    if (!conn) {
      return;
    }

    conn._endHandler();
  }

  _timeoutTick() {
    for (const conn of connections.values()) {
      conn._timeoutTick();
    }
  }

  _closeHandler(socket) {
    const conn = connections.get(socket);
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
