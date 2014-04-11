var cradle = require('cradle');
var crypto = require('crypto');

var userPrefix = "org.couchdb.user:"

cradle.setup({
  host: process.env.DB_HOST,
  port: 80,
  cache: false,
  timeout: 5000
})

var conn = new (cradle.Connection)({
  secure: true,
  auth: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
})

var db = conn.database('_users')

function register(name, pin, callback){
  db.get(name, function (err, doc) {
    if(err && err.error === 'not_found'){
      createUser(name, pin, callback)
    } else if(err) {
      callback(err)
    } else {
      callback({error: 'user_exists'})
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
  var longPassword = generateLongPassword()
  var password = longPassword + pin
  var hashAndSalt = generatePasswordHash(password)

  db.save(userPrefix + name, {
    name: name,
    password_sha: hashAndSalt[0],
    salt: hashAndSalt[1],
    password_scheme: 'simple',
    type: 'user',
    long_password: longPassword,
    failed_attempts: 0
  }, function(err, res){
    if(err) return callback(err);
    callback(null, longPassword)
  })
}

function generateLongPassword(){
  return crypto.randomBytes(64).toString('hex');
}

function generatePasswordHash(password){
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.createHash('sha1');
  hash.update(password + salt);
  return [hash.digest('hex'), salt];
}

function verifyPin(user, name, pin, callback) {
  var password = user.long_password + pin
  var hash = crypto.createHash('sha1')
  var sha = hash.update(password + user.salt).digest('hex')
  if(sha === user.password_sha) {
    callback(null, user.long_password)
  } else {
    incrementFailCount(user, callback)
  }
}

function incrementFailCount(user, callback) {
  var counter = { failed_attempts: user.failed_attempts + 1 }
  db.merge(user._id, counter, function(err, res){
    if(err) {
      console.error('FATAL: failed to increament counter')
    }

    callback({error: 'auth_failed'})
  })
}

function getUser(name) {
  db.get(name, function (err, doc) {
    console.log(arguments)
  })
}

module.exports = {
  register: register,
  login: login
}
