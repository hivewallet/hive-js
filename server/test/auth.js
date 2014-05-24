var auth = require('../auth')
var assert = require('assert')
var db = require('../db')
var userDB = db('_users')

describe('auth', function(){
  describe('GET exist', function(){
    var name = "foobar"
    var nameInDB = "org.couchdb.user:" + name
    beforeEach(function(done){
      auth.register(name, 111111, done)
    })

    it('true if user exists', function(done){
      auth.exist(name, function(err, exist){
        assert(exist)
        done()
      })
    })

    it('false if user does not exist', function(done){
      userDB.get(nameInDB, function (err, user) {
        if(err && err.error === 'not_found'){
          runTest()
        }else {
          userDB.remove(user._id, user._rev, function(err, res){
            assert(!err)
            runTest()
          })
        }
      })

      function runTest(){
        auth.exist(name, function(err, exist){
          assert(!exist)
          done()
        })
      }
    })
  })
})
