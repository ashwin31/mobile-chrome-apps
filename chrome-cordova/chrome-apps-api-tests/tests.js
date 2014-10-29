(function() {

'use strict';

var exports = window;

exports.tests = Object.create(null);

function getTestsObject(api) {
  return window.tests[api] = window.tests[api] || { enabled: true };
}

// Usage:
// registerAutoTests('apiName', function() {
//   define('foo', function() {
//     .. jasmine tests ..
//   });
// });
exports.registerAutoTests = function(api, fn) {
  var apiTests = getTestsObject(api);
  apiTests.defineAutoTests = function(jasmineInterface) {
    jasmineInterface.describe(api + ' >>', function() {
      fn(jasmineInterface); // Note: don't pass fn directly to jasmine.describe, since describe does async magic if fn takes an arg
    });
  };
};

exports.defineAutoTests = function(jasmineInterface) {
  Object.keys(exports.tests).forEach(function(key) {
    if (!exports.tests[key].enabled)
      return;
    if (!exports.tests[key].hasOwnProperty('defineAutoTests'))
      return;
    exports.tests[key].defineAutoTests(jasmineInterface);
  });
};

// Usage:
// registerManualTests('apiName', function(contentEl, addButton) {
//   .. setup ..
//   addButton('Test Description', function() { ... });
//   addButton('Test 2', function() { ... });
// });
exports.registerManualTests = function(api, fn) {
  var apiTests = getTestsObject(api);
  apiTests.defineManualTests = function(contentEl, addButton) {
    fn(contentEl, addButton);
  };
}

exports.defineManualTests = function(contentEl, beforeEach, createActionButton) {
  Object.keys(exports.tests).forEach(function(key) {
    if (!exports.tests[key].enabled)
      return;
    if (!exports.tests[key].hasOwnProperty('defineManualTests'))
      return;
    createActionButton(key, function() {
      beforeEach();
      exports.tests[key].defineManualTests(contentEl, createActionButton);
    });
  });
};

// TODO: make a better logger
exports.logger = function() {
  console.log.apply(console, arguments);
  medic.log.apply(medic.log, arguments);

  var el = top.document.getElementById('log--content');
  if (el) {
    var div = top.document.createElement('div');
    div.classList.add('log--content--line');
    div.textContent = Array.prototype.slice.apply(arguments).map(function(arg) {
        return (typeof arg === 'string') ? arg : JSON.stringify(arg);
      }).join(' ');
    el.appendChild(div);
    // scroll to bottom
    el.scrollTop = el.scrollHeight;
  }
}

}());
