'use strict';

var xhr = require('hive-xhr')

function sendRequest(paramsObj, callback) {
  // Hive version := Hive Web
  paramsObj['fields[21684549]'] = 'hive-js'
  // Browser := user agent
  paramsObj['fields[22083979]'] = navigator.userAgent

  var params = Object.keys(paramsObj).map(function(key) {
    return key + '=' + encodeURIComponent(paramsObj[key])
  }).join('&')

  var uri = "https://hivewallet.zendesk.com/requests/embedded/create/?" + params
  var corsUri = process.env.PROXY_URL + "?url=" + encodeURIComponent(uri)

  xhr({
    uri: corsUri
  }, function(err, resp, body) {
    if (resp.statusCode !== 201) {
      console.error(body)
      return callback(err)
    }
    callback(null)
  })
}

module.exports = sendRequest
