'use strict'

module.exports = function() {
  return window.hasOwnProperty('cordova') ? 'https://hive-js.herokuapp.com' : window.location.origin;
}
