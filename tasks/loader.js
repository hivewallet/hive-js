var async = require('async')
var bundle = require('./util').bundle

process.env.LANGUAGE = process.env.LANGUAGE || 'en'

function loader(callback) {
  async.parallel([
    function(cb) { bundle('./app/loader/nope.js', './build/assets/js/nope-' + process.env.LANGUAGE + '.js', cb) },
    function(cb) { bundle('./app/loader/index.js', './build/assets/js/loader.js', cb) }
  ], callback)
}

module.exports = loader
