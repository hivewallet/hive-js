'use strict';

var xhr = require('xhr')
var uriRoot = "http://localhost:8080/"

function register(wallet_id, pin, callback) {
  postCredentials('register', wallet_id, pin, callback)
}

function login(wallet_id, pin, callback) {
  postCredentials('login', wallet_id, pin, callback)
}

function postCredentials(endpoint, wallet_id, pin, callback) {
  xhr({
    uri: uriRoot + endpoint,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
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
