'use strict'

var xhr = require('xhr')

function makeRequest(params, callback){
  if(params && !params.timeout) {
    params.timeout = 30 * 1000
  }

  xhr(params, function(err){
    if(err && err.message === 'Internal XMLHttpRequest Error') {
      return alert("Request timeout. Please check your internet connection.")
    }
    callback.apply(null, arguments)
  })
}

module.exports = makeRequest
