"use strict"

var express = require('express')
var http = require('http')
var path = require('path')
var auth = require('./auth')

var app = express()
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'build')))

app.post('/register', function(req, res) {
  console.log('body', req.body)
  var name = req.body.wallet_id
  var password = req.body.pin
  if (!name || !password) {
    return res.send(400, 'Bad request');
  }

  auth.register(name, password, function(err, longPassword){
    if(err) {
      console.error('error', err)
      return res.send(500, err);
    }

    console.log('registered wallet %s', name)
    res.send(201, longPassword)
  })
});

var server = http.createServer(app);
server.listen(process.env.PORT || 9009, function() {
  console.info('server listening on http://localhost:' + server.address().port)
});

