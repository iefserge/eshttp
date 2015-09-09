'use strict';
var dateCached = '';
var dateValue = 0;
var refcount = 0;
var interval = null;

function updateDate() {
  var date = new Date();
  dateCached = date.toUTCString();
  dateValue = Math.round(date.getTime() / 1000);
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

exports.ref = function() {
  if (++refcount === 1) {
    // refresh date every 5 seconds to improve performance
    interval = setInterval(updateDate, 5000);
  }
};

exports.unref = function() {
  if (--refcount === 0) {
    clearInterval(interval);
    interval = null;
  }
};
