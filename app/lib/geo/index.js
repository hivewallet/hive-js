'use strict';

var xhr = require('hive-xhr')
var emitter = require('hive-emitter')
var db = require('hive-db')
var getWallet = require('hive-wallet').getWallet
var uriRoot = require('hive-origin')()
var userInfo = {}

function fetchUserInfo(callback){
  db.get(function(err, doc){
    if(err) return callback(err);

    userInfo = {}
    userInfo.name = doc.userInfo.firstName
    userInfo.email = doc.userInfo.email
    userInfo.avatarIndex = doc.userInfo.avatarIndex
    userInfo.address = getWallet().currentAddress

    callback()
  })
}

function search(callback){
  getLocation(function(err, lat, lon){
    if(err) return callback(err);

    fetchUserInfo(function(err){
      if(err) {
        console.error(err)
        //proceed with an earlier version of userInfo
      }

      userInfo.lat = lat
      userInfo.lon = lon

      xhr({
        uri: uriRoot + "/location",
        headers: { "Content-Type": "application/json" },
        method: 'POST',
        body: JSON.stringify(userInfo)
      }, function(err, resp, body){
        if(resp.statusCode !== 200) {
          console.error(body)
          return callback(body)
        }
        callback(null, JSON.parse(body))
      })
    })
  })
}

function remove(sync){
  xhr({
    uri: uriRoot + "/location",
    headers: { "Content-Type": "application/json" },
    method: 'DELETE',
    sync: sync
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
    } else {
      console.log('location data removed')
    }
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
    callback(new Error('Unable to retrieve your location'))
  }

  navigator.geolocation.getCurrentPosition(success, error)
}

module.exports = {
  search: search,
  remove: remove
}
