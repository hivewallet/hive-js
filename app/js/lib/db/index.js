var emitter = require('hive-emitter')
var PouchDB = require('pouchdb')
var getWallet = require('hive-wallet').getWallet
var $ = require('browserify-zepto')
var CJS = require('crypto-js')
var AES = CJS.AES
var utf8Encode = CJS.enc.Utf8

var db = new PouchDB('hive')
var id = null
var key = null

function set(key, value, callback){
  if(id == null) return;

  db.get(id, function(err, doc){
    var data = JSON.parse(decrypt(doc.data))
    $.extend(true, data[key], value)

    doc.data = encrypt(JSON.stringify(data))
    db.put(doc, callback)
  })
}

function get(key, callback) {
  if(id == null) return;

  db.get(id, function(err, doc){
    var data = JSON.parse(decrypt(doc.data))
    var value = data[key]
    if(key instanceof Function){
      value = data
      callback = key
    }
    callback(err, value)
  })
}

function encrypt(text) {
  return AES.encrypt(text, key).toString()
}

function decrypt(text) {
  return utf8Encode.stringify(AES.decrypt(text, key))
}

emitter.on('wallet-ready', function(){
  var wallet = getWallet()
  id = wallet.id
  key = wallet.getSeed()

  db.get(id, function(err, doc){
    if(err) {
      if(err.status === 404) return initializeRecord();
      return callback(err)
    }

    emitter.emit('db-ready')
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
    data: encrypt(JSON.stringify(defaultValue))
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
