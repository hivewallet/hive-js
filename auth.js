var cradle = require('cradle');
var crypto = require('crypto');

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

function register(name, password, callback){
  db.get(name, function (err, doc) {
    if(err && err.error === 'not_found'){
      createUser(name, password, callback)
    } else if(err) {
      callback(err)
    } else {
      callback({error: 'user_exists'})
    }
  })
}

function createUser(name, pin, callback){
  var longPassword = generateLongPassword()
  var password = longPassword + pin
  var hashAndSalt = generatePasswordHash(password)

  db.save("org.couchdb.user:" + name, {
    name: name,
    password_sha: hashAndSalt[0],
    salt: hashAndSalt[1],
    password_scheme: 'simple',
    type: 'user',
    long_password: longPassword
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

function getUser(name) {
  db.get(name, function (err, doc) {
    console.log(arguments)
  })
}

module.exports = {
  register: register
}
