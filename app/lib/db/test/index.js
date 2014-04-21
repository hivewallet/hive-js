var emitter = require('hive-emitter')
var db = require('../')

var local = db._local
var remote = db._remote

describe('db', function() {
  describe('on wallet-ready', function(){
    beforeEach(function(){
      emitter.emit('wallet-ready')
    })

    describe('one-time synchronization', function() {
      describe('when both remote and local are empty', function() {
        it('initializes local with default values', function() {
        })

        it('does not replicate default values to remote', function() {
        })
      })
    })

    it('emits db-ready on change from remote', function() {
    })
  })
});
