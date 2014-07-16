"use strict"

var app = require('./express')()
var http = require('http')
var geo = require('./geo')
var agent = require('webkit-devtools-agent')

agent.start(9999, 'localhost', 3333, true)

var server = http.createServer(app)
server.listen(process.env.PORT || 9009, function() {
  console.info('server listening on http://localhost:' + server.address().port)
})

var interval = 4 * 60 * 60 * 1000 // 4 hours
setInterval(function(){
  var oldEntries = geo.getIdsOlderThan(interval)
  console.info('removing' + oldEntries)
  oldEntries.forEach(geo.remove)
}, interval)

process.on('SIGUSR2', function() {
  if (agent.server) {
    agent.stop()
  } else {
    agent.start()
  }
})
