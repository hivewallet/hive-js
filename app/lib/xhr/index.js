'use strict'

var xhr = require('xhr')
var emitter = require('hive-emitter')

function makeRequest(params, callback){
  if(params && !params.timeout) {
    params.timeout = 30 * 1000
  }

  xhr(params, function(err){
    if(err && err.message === 'Internal XMLHttpRequest Error') {
      emitter.emit('open-error', { message: "Request timeout. Please check your internet connection." })
      return;
    }
    callback.apply(null, arguments)
  })
}

module.exports = makeRequest
