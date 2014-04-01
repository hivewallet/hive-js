var PouchDB = require('pouchdb')

var db = new PouchDB('hive')
db.upsert = function(id, value, callback){
  db.get(id, function(err, doc){
    value._id = id
    if(err) {
      if(err.status === 404) return db.put(value, callback);
      return callback(err)
    }

    value._rev = doc._rev
    db.put(value, callback)
  })
}

module.exports = db
