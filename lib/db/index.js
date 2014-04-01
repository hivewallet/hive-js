var emitter = require('hive-emitter')
var PouchDB = require('pouchdb')
var getWallet = require('hive-wallet').getWallet

var db = new PouchDB('hive')
var id = null

emitter.on('wallet-ready', function(){
  id = getWallet().id

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
    _id: id,
    systemInfo: { preferredCurrency: 'USD' }
  }

  db.put(defaultValue, function(err, response){
    if(err) return console.error(err);

    emitter.emit('db-ready')
  })
}

function set(key, value, callback){
  if(id == null) return;

  db.get(id, function(err, doc){
    doc[key] = value
    db.put(doc, callback)
  })
}

function get(key, callback) {
  if(id == null) return;

  db.get(id, function(err, doc){
    callback(err, doc[key])
  })
}

module.exports = {
  set: set,
  get: get
}
