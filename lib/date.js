'use strict';
var dateCached = '';
var dateValue = 0;
var refcount = 0;
var interval = null;
var servers = [];

function updateDate() {
  var date = new Date();
  dateCached = date.toUTCString();
  dateValue = Math.round(date.getTime() / 1000);

  for (var i = 0, l = servers.length; i < l; ++i) {
    servers[i]._timeoutTick();
  }
}

// set initial date
updateDate();

// get date string to use in http header
exports.getDateHeaderString = function() {
  return dateCached;
};

// get date value for header caching
exports.getDateValue = function() {
  return dateValue;
};

exports.ref = function(server) {
  servers.push(server);
  if (++refcount === 1) {
    // refresh date every 5 seconds to improve performance
    interval = setInterval(updateDate, 5000);
  }
};

exports.unref = function(server) {
  servers.splice(servers.indexOf(server), 1);
  if (--refcount === 0) {
    clearInterval(interval);
    interval = null;
  }
};
