'use strict';
var net = require('net');

exports.createServerHandle = function(httpServer) {
  return net.createServer(function(socket) {
    socket.on('data', function(nodebuf) {
      httpServer._dataHandler(socket, nodebuf);
    });

    socket.on('end', function() {
      httpServer._endHandler(socket);
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
