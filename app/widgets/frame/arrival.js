// Arrival 0.0.3
// Copyright (c) 2014 Max Wheeler, Icelab
// Licensed under the MIT license
(function(root, factory) {

  // Set up Arrival appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Arrival.
      root.Arrival = factory(root, exports);
    });

  // Next for Node.js or CommonJS
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);
  } else {

    // Finally, as a browser global.
    root.Arrival = factory(root, {});
  }
}(this, function(root, Arrival) {
  "use strict";
  // https://github.com/pgherveou/prefix/blob/master/index.js
  var prefixes = ['webkit','Moz','ms','O'],
      len = prefixes.length,
      p = document.createElement('p'),
      style = p.style,
      capitalize = function (str) {return str.charAt(0).toUpperCase() + str.slice(1);},
      dasherize = function(str) {
        return str.replace(/([A-Z])/g, function(str,m1) {
          return '-' + m1.toLowerCase();
        });
      };
  // Nullify p to release dom node
  p = null;

  var prefix = function(ppty, dasherized) {
    var Ppty, name, Name;

    // Test without prefix
    if (style[ppty] !== undefined) {
      if (!dasherized) return ppty;
      return dasherize(ppty);
    }
    // Test with prefix
    Ppty = capitalize(ppty);
    for (var i = 0; i < len; i++) {
      name = prefixes[i] + Ppty;
      if (style[name] !== undefined) {
        if (!dasherized) return name;
        return '-' + prefixes[i].toLowerCase() + '-' + dasherize(ppty);
      }
    }
    // Not found return empty string
    return '';
  };

  // Iterate through descendants to get transition times
  var getLongestTransitionElementAndTime = function(scope, descendantSelector, longestTotal, longestTransitionElement) {
    var descendants = scope.querySelectorAll(descendantSelector),
        totalDescendants = descendants.length;
    for (var i = 0; i < totalDescendants; i++) {
      var descendant = descendants[i],
      total = getElementTransitionTime(descendant);
      if(total > longestTotal) {
        longestTotal = total;
        longestTransitionElement = descendant;
      }
    }
    return {
      longestTotal: longestTotal,
      longestTransitionElement: longestTransitionElement
    };
  };

  // Find the sum of the transition duration/delay for a given element
  var getElementTransitionTime = function(element) {
    var elementStyle = getComputedStyle(element, null),
    duration = parseSecondsToMilliseconds(
        elementStyle[prefix("transitionDuration")]
      ),
      delay = parseSecondsToMilliseconds(
        elementStyle[prefix("transitionDelay")]
      );
    return delay + duration;
  };

  // Parse assumed second string values into milliseconds
  var parseSecondsToMilliseconds = function(n) {
    return parseFloat(n) * 1000;
  };

  // Main Arrival method, takes an element, callback and an optional
  // descendantSelector.
  var complete = Arrival.complete = function(element, callback, descendantSelector) {
    var results, safety,
      longestTotal = getElementTransitionTime(element) || 0,
      longestTransitionElement = element,
    descendantSelector = descendantSelector || "*";
    // Find the longest transitionable element/time
    results = getLongestTransitionElementAndTime(element, descendantSelector, longestTotal, longestTransitionElement);
    longestTotal = results.longestTotal;
    longestTransitionElement = results.longestTransitionElement;
    if (typeof longestTransitionElement !== "undefined" && longestTransitionElement !== null) {
      var onTransitionEnd = function() {
        clearTimeout(safety);
        callback();
      };
      // Bind the callback to transitionEnd
      longestTransitionElement.addEventListener(prefix("transitionend"), onTransitionEnd, false);
      // Create a timeout to fire at the same time as the event listener
      safety = setTimeout(function() {
        callback();
        longestTransitionElement.removeEventListener(prefix("transitionend"), onTransitionEnd);
      }, longestTotal);
    } else {
      // Just in case, fire the callback all the time
      callback();
    }
  };
  return Arrival;
}));
