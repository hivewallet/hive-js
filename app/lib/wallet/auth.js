'use strict';

var xhr = require('xhr')
var uriRoot = window.location.origin

function register(wallet_id, pin, callback) {
  postCredentials('register', wallet_id, pin, callback)
}

function login(wallet_id, pin, callback) {
  postCredentials('login', wallet_id, pin, callback)
}

function postCredentials(endpoint, wallet_id, pin, callback) {
  xhr({
    uri: uriRoot + "/" +  endpoint,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    timeout: 10000,
    body: "wallet_id=" + wallet_id + "&pin=" + pin
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
      return callback(JSON.parse(body))
    }
    callback(null, body)
  })
}

module.exports = {
  register: register,
  login: login
}
