'use strict';

var xhr = require('xhr')
var emitter = require('hive-emitter')
var db = require('hive-db')
var uriRoot = window.location.origin
var userInfo = {}

emitter.on('db-ready', function(){
  db.get(function(err, doc){
    if(err) return console.error(err);

    userInfo.name = [
      doc.userInfo.firstName,
      doc.userInfo.lastName
    ].join(' ')
    userInfo.email = doc.userInfo.email
    userInfo.id = db.userID()
  })
})

function search(callback){
  getLocation(function(err, lat, lon){
    if(err) return callback(err);

    userInfo.lat = lat
    userInfo.lon = lon

    xhr({
      uri: uriRoot + "/location",
      headers: { "Content-Type": "application/json" },
      method: 'POST',
      timeout: 10000,
      body: JSON.stringify(userInfo)
    }, function(err, resp, body){
      if(resp.statusCode !== 200) {
        console.error(body)
        return callback(JSON.parse(body))
      }
      callback(null, JSON.parse(body))
    })
  })
}

function getLocation(callback){
  if (!navigator.geolocation){
    return callback(new Error('Your browser does not support geolocation'))
  }

  var success = function(position){
    callback(null, position.coords.latitude, position.coords.longitude)
  }

  var error = function(){
    callback(new Error('Unable to retreive your location'))
  }

  navigator.geolocation.getCurrentPosition(success, error)
}

module.exports = {
  search: search
}
