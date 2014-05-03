var db = require('./db')('geo')
var geohash = require('geo-hash')

function setup(callback) {
  db.exists(function(err, exist){
    if(err) {
      return callback(err)
    } else if(!exist) {
      db.create(function(err, res){
        if(err) return callback(err);
        createSecurityDoc()
      })
    } else callback()
  })

  function createSecurityDoc() {
    db.save('_security', {
      couchdb_auth_only: true,
      admins: { names: [process.env.DB_USER], roles: [] },
      members: { names: [process.env.DB_USER], roles: [] }
    }, function(err, res){
      callback(err)
    })
  }
}

function save(lat, lon, info, callback) {
  db.save(geohash.encode(lat, lon), info, callback)
}

setup(function (err){
  if(err) console.error(err);
})

module.exports = {
  setup: setup,
  save: save
}
