'use strict';
var testServer = null;

exports.getServer = function() {
  return testServer;
};

exports.createServerHandle = function(httpServer) {
  testServer = {
    addConnection: function(onsend, onclose) {
      var conn = {
        data: function(u8) {
          httpServer._dataHandler(conn, u8);
        },
        end: function() {
          httpServer._endHandler(conn);
        },
        onsend: onsend,
        onclose: onclose
      };
      httpServer._connectionHandler(conn);
      return conn;
    },
  };

  return testServer;
};

exports.listen = function(handle, port) {};
exports.unlisten = function(handle) {};

exports.sendAndClose = function(socket, u8) {
  socket.onsend(u8);
  socket.onclose(u8);
};
