'use strict';

var PouchDB = require('pouchdb')
var db = new PouchDB('hive-local')
var AES = require('hive-aes')

var credentials = "credentials"

function saveSeed(id, seed, token, callback) {
  db.get(credentials, function(err, doc){
    if(doc) {
      return db.remove(doc, function(err, doc){
        if(err) return callback(err);

        saveSeed(id, seed, token, callback)
      })
    }

    var encryptedSeed = AES.encrypt(seed, token)
    var doc = {
      _id: credentials,
      id: id,
      seed: encryptedSeed
    }
    db.put(doc, callback)
  })
}

module.exports = {
  saveSeed: saveSeed
}
