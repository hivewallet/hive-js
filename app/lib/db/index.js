'use strict';

var emitter = require('hive-emitter')
var PouchDB = require('pouchdb')
var getWallet = require('hive-wallet').getWallet
var $ = require('browserify-zepto')
var AES = require('hive-aes')
var encrypt = AES.encrypt
var decrypt = AES.decrypt

var db = new PouchDB('hive')
var remote = null
var id = null
var sercret = null

function set(key, value, callback){
  if(id == null) return;

  db.get(id, function(err, doc){
    var data = JSON.parse(decrypt(doc.data, sercret))
    $.extend(true, data[key], value)

    doc.data = encrypt(JSON.stringify(data), sercret)
    db.put(doc, callback)

    PouchDB.replicate(db, remote, function(err, res){
      if(err) console.error("failed to replicate changes to server", err)
    })
  })
}

function get(key, callback) {
  if(id == null) return;

  db.get(id, function(err, doc){
    var data = JSON.parse(decrypt(doc.data, sercret))
    var value = data[key]
    if(key instanceof Function){
      value = data
      callback = key
    }
    callback(err, value)
  })
}

emitter.on('wallet-ready', function(){
  var wallet = getWallet()
  id = wallet.id
  sercret = wallet.getSeed()

  remote = [
    "https://",
    id, ":", wallet.token, wallet.pin,
    "@hive.cloudant.com/hive", wallet.id
  ].join('')
  remote = new PouchDB(remote)

  PouchDB.sync(db, remote, {
    complete: function(){
      db.get(id, function(err, doc){
        if(err) {
          if(err.status === 404) return initializeRecord();
          return console.error(err)
        }

        emitter.emit('db-ready')
      })
    }
  })

  PouchDB.replicate(remote, db, {
    live: true,
    onChange: function() {
      emitter.emit('db-ready')
    }
  })
})

function initializeRecord(){
  var defaultValue = {
    systemInfo: { preferredCurrency: 'USD' },
    userInfo: {
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'alice@example.com'
    }
  }

  var doc = {
    _id: id,
    data: encrypt(JSON.stringify(defaultValue), sercret)
  }

  db.put(doc, function(err, response){
    if(err) return console.error(err);

    emitter.emit('db-ready')
  })
}

module.exports = {
  set: set,
  get: get
}
