'use strict';

// according to rfc 2616
function isValidToken(c) {
  var isInvalid = c <= 0x20 || c >= 0x7f ||
    c === 40 || c === 41 ||   // ( )
    c === 60 || c === 62 ||   // < >
    c === 64 || c === 44 ||   // @ ,
    c === 59 || c === 58 ||   // ; :
    c === 92 || c === 34 ||   // \ "
    c === 47 || c === 91 ||   // / [
    c === 93 || c === 63 ||   // ] ?
    c === 61 || c === 123 ||  // = {
    c === 125;                // }
  return !isInvalid;
}

var table = new Uint8Array(256);
for (var i = 0; i < 256; ++i) {
  table[i] = isValidToken(i) ? i : 0;
}

function isValidCharCode(charCode) {
  return table[charCode & 0xff];
}

exports.isValidCharCode = isValidCharCode;

exports.isValidMethodCharCode = function(charCode) {
  return charCode >= 65 && charCode <= 90; // A-Z
};

exports.isValidToken = function(str) {
  if (!str) {
    return false;
  }

  for (var i = 0; i < str.length; ++i) {
    if (!isValidCharCode(str.charCodeAt(i))) {
      return false;
    }
  }

  return true;
};

exports.isValidHeaderName = isValidToken;

exports.isValidHeaderValue = function(str) {
  for (var i = 0; i < str.length; ++i) {
    var code = str.charCodeAt(i);
    if (code > 127 || code === 0 || code === 10 /* \n */ || code === 13 /* \r */) {
      return false;
    }
  }

  return true;
};
