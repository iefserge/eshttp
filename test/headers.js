'use strict';
var test = require('tape');
var Headers = require('../headers');

test('construct basic headers object', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  t.equal(h.get('x-header-1'), 'value1');
  t.equal(h.get('X-Header-1'), 'value1');
  t.equal(h.get('X-HEADER-1'), 'value1');
  t.equal(h.get('x-header-2'), 'value2');
  t.equal(h.get('X-Header-2'), 'value2');
  t.equal(h.get('X-HEADER-2'), 'value2');
  t.equal(h.has('x-header-1'), true);
  t.equal(h.has('X-Header-1'), true);
  t.equal(h.has('X-HEADER-1'), true);
  t.equal(h.has('x-header-2'), true);
  t.equal(h.has('X-Header-2'), true);
  t.equal(h.has('X-HEADER-2'), true);
  t.end();
});

test('append header', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  h.append('x-HEADER-3', 'value3');
  t.equal(h.get('x-header-3'), 'value3');
  t.equal(h.has('x-header-3'), true);
  t.end();
});

test('set new header', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  h.set('x-HEADER-3', 'value3');
  t.equal(h.get('x-header-3'), 'value3');
  t.equal(h.has('x-header-3'), true);
  t.end();
});

test('set existing header', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  h.set('x-HEADER-2', 'value3');
  t.equal(h.get('x-header-2'), 'value3');
  t.equal(h.has('x-header-2'), true);
  t.end();
});

test('delele existing header', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  h.delete('x-HEADER-2', 'value3');
  t.equal(h.get('x-header-1'), 'value1');
  t.equal(h.has('x-header-1'), true);
  t.equal(h.get('x-header-2'), null);
  t.equal(h.has('x-header-2'), false);
  t.end();
});

test('delele non-existing header', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  h.delete('x-HEADER-10', 'value3');
  t.equal(h.get('x-header-1'), 'value1');
  t.equal(h.has('x-header-1'), true);
  t.equal(h.get('x-header-2'), 'value2');
  t.equal(h.has('x-header-2'), true);
  t.end();
});

test('headers iterator', function(t) {
  var h = new Headers({
    'x-header-1': 'value1',
    'X-HEADER-2': 'value2'
  });

  var index = 0;
  for (var header of h) {
    if (index++ === 0) {
      t.equal(header[0], 'x-header-1');
      t.equal(header[1], 'value1');
    } else {
      t.equal(header[0], 'x-header-2');
      t.equal(header[1], 'value2');
    }
  }

  index = 0;
  for (var headerName of h.keys()) {
    if (index++ === 0) {
      t.equal(headerName, 'x-header-1');
    } else {
      t.equal(headerName, 'x-header-2');
    }
  }

  index = 0;
  for (var headerValue of h.values()) {
    if (index++ === 0) {
      t.equal(headerValue, 'value1');
    } else {
      t.equal(headerValue, 'value2');
    }
  }

  t.end();
});
