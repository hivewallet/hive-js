var geo = require('../geo')
var assert = require('assert')

describe('geo', function(){
  describe('save', function(){
    it('stores geo, user id, user name and email', function(done){

      assert.deepEqual(geo.all, [])

      var userInfo = {userid: "foobar", name: "Wei Lu", email: "wei@example.com"}
      var lat = 34.2308391
      var lon = 108.8686767
      var geocells = [
        'd', 'da', 'da5', 'da51', 'da519', 'da519c', 'da519ce', 'da519cee',
        'da519cee5', 'da519cee57', 'da519cee570', 'da519cee5702', 'da519cee57022'
      ]

      geo.save(lat, lon, userInfo, function(){
        assert.equal(geo.all.length, 1)
        assert.deepEqual(geo.all[0], {
          id: 'foobar',
          name: 'Wei Lu',
          email: 'wei@example.com',
          location: {lat: lat, lon: lon},
          geocells: geocells
        })

        done()
      })
    })
  })
})
