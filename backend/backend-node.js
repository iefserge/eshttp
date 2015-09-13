'use strict';
var net = require('net');

exports.stringToBuffer = function(str) {
  return new Buffer(str);
};

// Server handle

exports.createServerHandle = function(httpServer) {
  return net.createServer(function(socket) {
    socket.on('data', function(nodebuf) {
      httpServer._dataHandler(socket, nodebuf);
    });

    socket.on('end', function() {
      httpServer._endHandler(socket);
    });

    socket.on('close', function() {
      httpServer._closeHandler(socket);
    });

    socket.on('error', function() {
    });

    httpServer._connectionHandler(socket);
  });
};

exports.listen = function(handle, port) {
  handle.listen(port);
};

exports.unlisten = function(handle) {
  handle.close();
};

exports.sendAndClose = function(socket, nodebuf) {
  socket.end(nodebuf);
};

exports.close = function(socket) {
  socket.end();
};

// Client handle

exports.createClientHandle = function(httpClient) {
  var socket = new net.Socket({
    allowHalfOpen: true
  });

  socket.on('connect', function() {
    httpClient._openHandler();
  });

  socket.on('data', function(nodebuf) {
    httpClient._dataHandler(nodebuf);
  });

  socket.on('end', function() {
    socket.end();
    httpClient._endHandler();
  });

  socket.on('close', function() {
    httpClient._closeHandler();
  });

  return socket;
};

exports.closeClientHandle = function(socket) {
  socket.end();
};

exports.connect = function(handle, ip, port) {
  handle.connect(port, ip);
};

exports.send = function(socket, nodebuf) {
  socket.write(nodebuf);
};
