"use strict"

var db = require('./db')
var userDB = db('_users')
var crypto = require('crypto')

var userPrefix = "org.couchdb.user:"

function exist(name, callback) {
  userDB.get(userPrefix + name, function (err, doc) {
    if(err && err.error === 'not_found'){
      callback(null, false)
    } else if(err) {
      console.error('error getting doc', err)
      callback({error: 'fetching_doc_failed'})
    } else {
      callback(null, true)
    }
  })
}

function register(name, pin, callback){
  exist(name, function(err, userExist){
    if(err) return callback(err)

    if(!userExist) {
      createUser(name, pin, function(err, token){
        if(err) return callback(err);
        createDatabase(name, function(err){
          if(err) return callback(err);

          callback(null, token)
        })
      })
    } else {
      login(name, pin, callback)
    }
  })
}

function login(name, pin, callback) {
  name = userPrefix + name
  userDB.get(name, function (err, doc) {
    if(err){
      console.error('error getting doc', err)
      callback({error: 'auth_failed'})
    } else {
      verifyPin(doc, name, pin, callback)
    }
  })
}

function disablePin(name, pin, callback){
  var error = {error: 'disable_pin_failed'}

  name = userPrefix + name
  userDB.get(name, function (err, user) {
    if(err){
      console.error('error getting user on disable pin', err)
      return callback(error)
    }

    verifyPin(user, name, pin, function(err, token){
      if(err) return callback(error)

      var hashAndSalt = generatePasswordHash(token)
      var credentials = {
        password_sha: hashAndSalt[0],
        salt: hashAndSalt[1]
      }

      userDB.merge(user._id, credentials, function(err, res){
        if(err) return callback(error);

        callback()
      })
    })
  })
}

function createUser(name, pin, callback){
  var token = generateToken()
  var password = token + pin
  var hashAndSalt = generatePasswordHash(password)

  userDB.save(userPrefix + name, {
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
  var hiveDB = db('hive' + name)
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
      admins: { names: [process.env.DB_USER], roles: [] },
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
  pin = pin || ''
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
  userDB.merge(id, { failed_attempts: counter }, function(err, res){
    if(err) {
      console.error('FATAL: failed to update counter to', counter)
    }
  })
}

function deleteUser(user, callback) {
  userDB.remove(user._id, user._rev, function(err, res){
    if(err) {
      console.error('FATAL: failed to delete user')
      return callback({error: 'auth_failed'})
    }

    callback({error: 'user_deleted'})
  })
}

function resetPin(name, callback) {
  name = userPrefix + name
  userDB.get(name, function (err, doc) {
    if(err){
      if(err.error === 'not_found') {
        return callback({error: 'user_deleted'})
      }

      console.error('error getting doc', err)
      callback({error: 'auth_failed'})
    } else {
      deleteUser(doc, callback)
    }
  })
}

module.exports = {
  register: register,
  login: login,
  exist: exist,
  disablePin: disablePin,
  resetPin: resetPin
}
