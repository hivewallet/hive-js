var lrserver = require('tiny-lr')()
var buildServer = require('../server/express')
var done = require('./util').done

var livereloadport = 35729

function serve(callback) {
  var serverport = 8080
  var server = buildServer()
  server.listen(serverport)
  lrserver.listen(livereloadport)

  done('server', 'start', callback)()
}

module.exports = {
  serve: serve,
  livereloadport: livereloadport
}
