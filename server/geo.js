var geomodel = require('geomodel').create_geomodel()

var all = []

function save(lat, lon, userInfo, callback) {
  var user = {
    id: 'foobar',
    name: 'Wei Lu',
    email: 'wei@example.com',
    location: geomodel.create_point(lat, lon),
  }
  user.geocells = geomodel.generate_geocells(user.location)

  all.push(user)

  callback()
}

module.exports = {
  all: all,
  save: save
}
