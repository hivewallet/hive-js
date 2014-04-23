"use strict"

var cradle = require('cradle')
var crypto = require('crypto')

var userPrefix = "org.couchdb.user:"

cradle.setup({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  cache: false,
  timeout: 5000
})

var conn = new (cradle.Connection)({
  secure: (process.env.NODE_ENV === "production"),
  auth: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
})

var db = conn.database('_users')

function register(name, pin, callback){
  db.get(userPrefix + name, function (err, doc) {
    if(err && err.error === 'not_found'){
      createUser(name, pin, function(err, token){
        if(err) return callback(err);
        createDatabase(name, function(err){
          if(err) return callback(err);

          callback(null, token)
        })
      })
    } else if(err) {
      callback(err)
    } else {
      login(name, pin, callback)
    }
  })
}

function login(name, pin, callback) {
  name = userPrefix + name
  db.get(name, function (err, doc) {
    if(err){
      console.error('error getting doc', err)
      callback({error: 'auth_failed'})
    } else {
      verifyPin(doc, name, pin, callback)
    }
  })
}

function createUser(name, pin, callback){
  var token = generateToken()
  var password = token + pin
  var hashAndSalt = generatePasswordHash(password)

  db.save(userPrefix + name, {
    name: name,
    password_sha: hashAndSalt[0],
    salt: hashAndSalt[1],
    password_scheme: 'simple',
    type: 'user',
    roles: [],
    token: token,
    failed_attempts: 0
  }, function(err, res){
    if(err) return callback(err);
    callback(null, token)
  })
}

function createDatabase(name, callback) {
  var hiveDB = conn.database('hive' + name)
  hiveDB.create(function(err){
    if(err) {
      if(err.error === 'file_exists') return callback(null);
      return callback(err);
    }
    createSecurityDoc()
  })

  function createSecurityDoc() {
    hiveDB.save('_security', {
      couchdb_auth_only: true,
      admins: { names: ["hive"], roles: [] },
      members: { names: [name], roles: [] }
    }, function(err, res){
      if(err) return callback(err);

      callback(null)
    })
  }
}


function generateToken(){
  return crypto.randomBytes(64).toString('hex')
}

function generatePasswordHash(password){
  var salt = crypto.randomBytes(16).toString('hex')
  var hash = crypto.createHash('sha1')
  hash.update(password + salt)
  return [hash.digest('hex'), salt]
}

function verifyPin(user, name, pin, callback) {
  var password = user.token + pin
  var hash = crypto.createHash('sha1')
  var sha = hash.update(password + user.salt).digest('hex')
  if(sha === user.password_sha) {
    if(user.failed_attempts) updateFailCount(user._id, 0)

    callback(null, user.token)
  } else {
    var counter = user.failed_attempts + 1
    if(counter >= 5) return deleteUser(user, callback);

    updateFailCount(user._id, counter)
    callback({error: 'auth_failed'})
  }
}

// ignores db op outcome
function updateFailCount(id, counter) {
  db.merge(id, { failed_attempts: counter }, function(err, res){
    if(err) {
      console.error('FATAL: failed to update counter to', counter)
    }
  })
}

function deleteUser(user, callback) {
  db.remove(user._id, user._rev, function(err, res){
    if(err) {
      console.error('FATAL: failed to delete user')
      return callback({error: 'auth_failed'})
    }

    callback({error: 'user_deleted'})
  })
}

module.exports = {
  register: register,
  login: login
}
