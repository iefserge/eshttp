'use strict';

// trying to be compatible with the spec
// (except browser security features)
// https://fetch.spec.whatwg.org/#headers-class
class Headers {
  constructor(data) {
    this._names = [];
    this._values = [];

    if (data) {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = data[key];

        if (key && value) {
          this._names.push(key.toLowerCase());
          this._values.push(value);
        }
      }
    }
  }

  has(name) {
    return this._names.indexOf(name.toLowerCase()) >= 0;
  }

  get(name) {
    var index = this._names.indexOf(name.toLowerCase());
    return index >= 0 ? this._values[index] : null;
  }

  getAll(name) {
    var result = [];
    name = name.toLowerCase();
    for (var i = 0, l = this._names.length; i < l; ++i) {
      if (this._names[i] === name) {
        result.push(this._values[i]);
      }
    }
    return result;
  }

  set(name, value) {
    name = name.toLowerCase();
    var index = this._names.indexOf(name);
    if (index >= 0) {
      this._values[index] = value;
      return;
    }

    this._names.push(name);
    this._values.push(value);
  }

  append(name, value) {
    this._names.push(name.toLowerCase());
    this._values.push(value);
  }

  delete(name) {
    name = name.toLowerCase();
    var index = this._names.indexOf(name);
    if (index === -1) {
      return;
    }

    var newNames = [];
    var newValues = [];
    for (var i = 0, l = this._names.length; i < l; ++i) {
      if (this._names[i] !== name) {
        newNames.push(this._names[i]);
        newValues.push(this._values[i]);
      }
    }

    this._names = newNames;
    this._values = newValues;
  }

  keys() {
    return this._names;
  }

  values() {
    return this._values;
  }
}

// TODO: use ES6 computed property in class body
// (when enabled in Node)
Headers.prototype[Symbol.iterator] = function*() {
  for (var i = 0, l = this._names.length; i < l; ++i) {
    yield [this._names[i], this._values[i]];
  }
};

module.exports = Headers;
