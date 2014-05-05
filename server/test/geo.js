var geo = require('../geo')
var assert = require('assert')

describe('geo', function(){
  var userInfo, lat, lon

  beforeEach(function(){
    userInfo = {id: "foobar", name: "Wei Lu", email: "wei@example.com"}
    lat = 34.2308391
    lon = 108.8686767
  })

  describe('save', function(){
    it('stores geo, user id, user name and email', function(done){
      assert.deepEqual(geo.all, [])

      var geocells = [
        'd', 'da', 'da5', 'da51', 'da519', 'da519c', 'da519ce', 'da519cee',
        'da519cee5', 'da519cee57', 'da519cee570', 'da519cee5702', 'da519cee57022'
      ]

      geo.save(lat, lon, userInfo, function(){
        assert.equal(geo.all.length, 1)
        assert.deepEqual(geo.all[0], {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          location: {lat: lat, lon: lon},
          geocells: geocells
        })

        done()
      })
    })
  })
})
