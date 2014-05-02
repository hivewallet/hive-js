var geo = require('../geo')
var assert = require('assert')
var db = require('../db')('geo')
var cradle = require('cradle')

describe('geo', function(){
  before(function(done){
    geo.setup(done)
  })

  describe('setup', function(){
    it('creates a database', function(done){
      db.exists(function(err, exist){
        assert(exist)
        done()
      })
    })

    it('only allow access by process.env.DB_USER', function(done){
      db.get('_all_docs', function(err, res){
        assert.equal(err, null)
        done()
      })
    })

    it('does not allow unauthorized access', function(done){
      cradle.setup({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        cache: false,
        timeout: 5000
      })

      var unauthConn = new (cradle.Connection)()
      unauthConn.database('geo').get('_all_docs', function(err, res){
        assert(err)
        assert.equal(err.error, 'unauthorized')
        done()
      })
    })
  })
})
