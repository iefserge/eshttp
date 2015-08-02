'use strict';
var dateCached = '';
var dateValue = 0;

function updateDate() {
  var date = new Date();
  dateCached = date.toUTCString();
  dateValue = Math.round(date.getTime() / 1000);
}

// set initial date
updateDate();

// refresh date every 5 seconds to improve performance
setInterval(updateDate, 5000);

// get date string to use in http header
exports.getDateHeaderString = function() {
  return dateCached;
};

// get date value for header caching
exports.getDateValue = function() {
  return dateValue;
};
