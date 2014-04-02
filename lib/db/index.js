var emitter = require('hive-emitter')
var PouchDB = require('pouchdb')
var getWallet = require('hive-wallet').getWallet

var db = new PouchDB('hive')
var id = null

function set(key, value, callback){
  if(id == null) return;

  db.get(id, function(err, doc){
    setDeepProperty(doc, key, value)
    db.put(doc, callback)
  })
}

function get(key, callback) {
  if(id == null) return;

  db.get(id, function(err, doc){
    var value = doc[key]
    if(key instanceof Function){
      value = doc
      callback = key
    }
    callback(err, value)
  })
}

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
    systemInfo: { preferredCurrency: 'USD' },
    userInfo: {
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'alice@example.com'
    }
  }

  db.put(defaultValue, function(err, response){
    if(err) return console.error(err);

    emitter.emit('db-ready')
  })
}

function setDeepProperty(obj, path, value) {
  var curr = obj
  path = path.split('.')

  for (var depth = 0; depth < path.length - 1; depth++){
    curr = curr[path[depth]]
  }

  curr[path[path.length - 1]] = value
}

module.exports = {
  set: set,
  get: get
}
