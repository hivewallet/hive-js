'use strict'

module.exports = function() {
  return window.hasOwnProperty('cordova') ? 'https://hive-js.herokuapp.com' : process.env.PROXY_URL;
}
