'use strict';

/* global runtime */
var TCPServerSocket = runtime.net.TCPServerSocket;

exports.createServerHandle = function(httpServer) {
  var socket = new TCPServerSocket();
  socket.onconnect = function(connSocket) {
    connSocket.ondata = function(u8) {
      httpServer._dataHandler(connSocket, u8);
    };

    connSocket.onend = function() {
      httpServer._endHandler(connSocket);
    };

    httpServer._connectionHandler(connSocket);
  };

  return socket;
};

exports.listen = function(handle, port) {
  handle.listen(port);
};

exports.unlisten = function(handle) {
  handle.close();
};

exports.sendAndClose = function(socket, u8) {
  socket.send(u8);
  socket.close();
};
