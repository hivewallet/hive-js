'use strict';

var PouchDB = require('pouchdb')
var db = new PouchDB('hive-local')
var AES = require('hive-aes')

function saveSeed(id, seed, token, callback) {
  var encryptedSeed = AES.encrypt(seed, token)

  var doc = {
    _id: "credentials",
    id: id,
    seed: encryptedSeed
  }

  db.put(doc, callback)
}

module.exports = {
  saveSeed: saveSeed
}
