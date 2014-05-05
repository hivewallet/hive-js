var geomodel = require('geomodel').create_geomodel()

var all = []

function save(lat, lon, userInfo, callback) {
  var user = cloneObject(userInfo)
  user.location = geomodel.create_point(lat, lon),
  user.geocells = geomodel.generate_geocells(user.location)

  all.push(user)

  callback()
}

function cloneObject(obj){
  return JSON.parse(JSON.stringify(obj))
}

module.exports = {
  all: all,
  save: save
}
