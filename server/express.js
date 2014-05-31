"use strict"

var express = require('express')
var path = require('path')
var auth = require('./auth')
var geo = require('./geo')
var validatePin = require('hive-pin-validator')

module.exports = function (prependMiddleware){
  var app = express()
  if(prependMiddleware) {
    app.use(prependMiddleware)
  }
  app.use(express.bodyParser())
  app.use(express.cookieParser(process.env.COOKIE_SALT))
  app.use(express.session())
  app.use(express.static(path.join(__dirname, '..', 'build')))

  app.post('/register', validateAuthParams(false), function(req, res) {
    var name = req.body.wallet_id
    auth.register(name, req.body.pin, function(err, token){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      setCookie(req, name, function(){
        console.log('registered wallet %s', name)
        res.send(200, token)
      })
    })
  })

  app.post('/login', validateAuthParams(true), function(req, res) {
    var name = req.body.wallet_id
    auth.login(name, req.body.pin, function(err, token){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      setCookie(req, name, function(){
        console.log('authenticated wallet %s', name)
        res.send(200, token)
      })
    })
  })

  app.get('/exist', function(req, res){
    var name = req.query.wallet_id
    if (!name) return res.send(400, 'Bad request');

    auth.exist(name, function(err, userExist){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      res.send(200, userExist)
    })
  })

  app.post('/location', restrict, function(req, res) {
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

  app.delete('/location', restrict, function(req, res) {
    var id = req.body.id

    geo.remove(id, function(err, found) {
      if(err) return res.json(400, err)
      res.json(200, found)
    })
  })

  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Oops! something went wrong.');
  })


  function validateAuthParams(allowMissingPin) {
    return function (req, res, next) {
      if (!req.body.wallet_id || !validatePin(req.body.pin, allowMissingPin)) {
        return res.send(400, 'Bad request')
      }

      next()
    }
  }

  function restrict(req, res, next) {
    var session_id = req.session.wallet_id
    if (session_id && session_id === req.body.id) {
      next()
    } else {
      return res.send(401)
    }
  }

  function setCookie(req, wallet_id, callback){
    req.session.regenerate(function(){
      req.session.wallet_id = wallet_id
      callback()
    })
  }

  return app
}

