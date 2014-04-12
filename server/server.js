"use strict"

var express = require('express')
var http = require('http')
var path = require('path')
var auth = require('./auth')

var app = express()
app.use(express.bodyParser())
app.use(express.static(path.join(__dirname, 'build')))

app.post('/register', validate_params, function(req, res) {
  var name = req.body.wallet_id
  auth.register(name, req.body.pin, function(err, longPassword){
    if(err) {
      console.error('error', err)
      return res.send(500, err)
    }

    console.log('registered wallet %s', name)
    res.send(201, longPassword)
  })
})

app.post('/login', validate_params, function(req, res) {
  var name = req.body.wallet_id
  auth.login(name, req.body.pin, function(err, longPassword){
    if(err) {
      console.error('error', err)
      return res.send(500, err)
    }

    console.log('authenticated wallet %s', name)
    res.send(200, longPassword)
  })
})

function validate_params(req, res, next) {
  if (!req.body.wallet_id || !req.body.pin) {
    return res.send(400, 'Bad request')
  }
  next()
}

var server = http.createServer(app)
server.listen(process.env.PORT || 9009, function() {
  console.info('server listening on http://localhost:' + server.address().port)
})

