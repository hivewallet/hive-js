'use strict';

var xhr = require('hive-xhr')
var uriRoot = require('hive-origin')()

function register(wallet_id, pin, callback) {
  postCredentials('register', wallet_id, pin, callback)
}

function login(wallet_id, pin, callback) {
  postCredentials('login', wallet_id, pin, callback)
}

function exist(wallet_id, callback) {
  xhr({
    uri: uriRoot + "/exist?wallet_id=" + wallet_id,
    method: 'GET'
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
      return callback(JSON.parse(body))
    }
    callback(null, body === 'true')
  })
}

function disablePin(wallet_id, pin, callback) {
  xhr({
    uri: uriRoot + "/pin",
    headers: { "Content-Type": "application/json" },
    method: 'DELETE',
    body: JSON.stringify({id: wallet_id, pin: pin})
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
      return callback(JSON.parse(body))
    }
    callback()
  })
}

function postCredentials(endpoint, wallet_id, pin, callback) {
  xhr({
    uri: uriRoot + "/" +  endpoint,
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
  login: login,
  exist: exist,
  disablePin: disablePin
}
