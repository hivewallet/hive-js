'use strict';

var PouchDB = require('pouchdb')
var db = new PouchDB('hive-local')

var credentials = "credentials"

function saveEncrypedSeed(id, encryptedSeed, callback) {
  db.get(credentials, function(err, doc){
    if(doc) {
      return db.remove(doc, function(err, doc){
        if(err) return callback(err);

        saveEncrypedSeed(id, encryptedSeed, callback)
      })
    }

    var doc = {
      _id: credentials,
      id: id,
      seed: encryptedSeed
    }
    db.put(doc, callback)
  })
}

module.exports = {
  saveEncrypedSeed: saveEncrypedSeed
}
