'use strict';

/* global runtime */
var TCPServerSocket = runtime.net.TCPServerSocket;
var TCPSocket = runtime.net.TCPSocket;
var enc = new TextEncoder();

exports.stringToBuffer = function(str) {
  return enc.encode(str);
};

exports.stringToSocketData = function(str) {
  return enc.encode(str);
};


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

exports.close = function(socket) {
  socket.close();
};

exports.send = function(socket, u8) {
  socket.send(u8);
};

exports.createClientHandle = function(httpClient) {
  var socket = new TCPSocket();

  socket.onopen = function() {
    httpClient._openHandler();
  }

  socket.ondata = function(u8) {
    httpClient._dataHandler(u8);
  }

  socket.onend = function() {
    socket.close();
    httpClient._endHandler();
  }

  socket.onclose = function() {
    httpClient._closeHandler();
  }

  return socket;
}

exports.closeClientHandle = function(socket) {
  socket.close();
}

exports.connect = function(handle, ip, port) {
  handle.open(ip, port);
}
