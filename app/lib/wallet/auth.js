'use strict';

var xhr = require('xhr')

function register(wallet_id, pin, callback) {
  var uri = "http://localhost:8080/register"
  xhr({
    uri: uri,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    body: "wallet_id=" + wallet_id + "&pin=" + pin
  }, function(err, resp, body){
    if(resp.statusCode !== 201) {
      console.error(body)
      return callback(err)
    }
    callback(null, body)
  })
}

module.exports = {
  register: register
}
