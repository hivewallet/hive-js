"use strict"

var express = require('express')
var http = require('http')
var path = require('path')

var app = express()
app.use(express.static(path.join(__dirname, 'build')))

var server = http.createServer(app);
server.listen(process.env.PORT || 9009, function() {
  console.info('server listening on http://localhost:' + server.address().port)
});
