"use strict"
var st = require('st')
var http = require('http')

var mount = st({
  path: __dirname + '/build',
  url: '/',
  index: 'index.html',
  cache: {
    content: {
      max: 1024*1024*64,
      maxAge: 1000*60
    }
  }
})

var server = http.createServer(mount)
server.listen(process.env.PORT || 9009, function() {
  console.info('server listening on http://localhost:' + server.address().port)
})

