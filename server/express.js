"use strict"

var express = require('express')
var path = require('path')
var auth = require('./auth')
var geo = require('./geo')

module.exports = function (prependMiddleware){
  var app = express()
  if(prependMiddleware) {
    app.use(prependMiddleware)
  }
  app.use(express.bodyParser())
  app.use(express.cookieParser('shhhh, very secret')) //TODO: env var
  app.use(express.session())
  app.use(express.static(path.join(__dirname, '..', 'build')))

  app.post('/register', validate_params, function(req, res) {
    var name = req.body.wallet_id
    auth.register(name, req.body.pin, function(err, token){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      console.log('registered wallet %s', name)
      res.send(200, token)
    })
  })

  app.post('/login', validate_params, function(req, res) {
    var name = req.body.wallet_id
    auth.login(name, req.body.pin, function(err, token){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      console.log('authenticated wallet %s', name)
      req.session.regenerate(function(){
        req.session.wallet_id = name
      })
      res.send(200, token)
    })
  })

  app.post('/location', function(req, res) {
    var data = req.body

    var lat = data.lat
    var lon = data.lon
    delete data.lat
    delete data.lon

    geo.save(lat, lon, data, function(err, found) {
      if(err) return res.json(400, err)
      res.json(200, found)
    })
  })

  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Oops! something went wrong.');
  })

  function validate_params(req, res, next) {
    if (!req.body.wallet_id || !req.body.pin) {
      return res.send(400, 'Bad request')
    }
    next()
  }

  return app
}

