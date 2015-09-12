'use strict';

class Request {
}

class Response {
}

function fetch(request) {
  return new Promise(function(resolve, reject) {
  });
}

module.exports = fetch;

global.Request = Request;
global.Response = Response;
global.fetch = fetch;
