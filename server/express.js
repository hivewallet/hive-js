"use strict"

var express = require('express')
var path = require('path')
var auth = require('./auth')
var geo = require('./geo')
var validatePin = require('hive-pin-validator')
var crypto = require('crypto')
var helmet = require('helmet')

module.exports = function (){
  var app = express()
  app.use(requireHTTPS)

  if(process.env.NODE_ENV === "production"){
    var proxyHost = process.env.PROXY_URL.replace("https://", '')
    app.use(helmet.csp({
      'default-src': ["'self'"],
      'connect-src': [
        "'self'",
        'api.bitcoinaverage.com', 'chain.so', // tickers
        'btc.blockr.io', 'tbtc.blockr.io', 'ltc.blockr.io', // blockchain APIs
        process.env.DB_HOST, proxyHost
      ],
      'font-src': ['s3.amazonaws.com'],
      'img-src': ["'self'", 'data:', 'www.gravatar.com'],
      'style-src': ["'self'", 's3.amazonaws.com'],
      'script-src': ["'self'", 'blob:', "'unsafe-eval'"], // http://lists.w3.org/Archives/Public/public-webappsec/2014Apr/0021.html, https://github.com/ractivejs/ractive/issues/285
      reportOnly: false,
      setAllHeaders: false,
      safari5: true
    }))
    app.use(helmet.iexss())
    app.use(helmet.xframe('sameorigin'))

    var ninetyDaysInMilliseconds = 90 * 24 * 60 * 60 * 1000
    app.use(helmet.hsts({
      maxAge: ninetyDaysInMilliseconds,
      includeSubdomains: true
    }))
  }

  app.use(express.bodyParser())
  app.use(express.cookieParser(process.env.COOKIE_SALT))
  app.use(express.cookieSession({
    cookie: {
      maxAge: 1000*60*60,
      httpOnly: true,
      proxy: true
    }
  }))
  app.use(express.compress())
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
    if (!name) return res.send(400, {error: 'Bad request'});

    auth.exist(name, function(err, userExist){
      if(err) {
        console.error('error', err)
        return res.send(400, err)
      }

      res.send(200, userExist)
    })
  })

  app.delete('/pin', restrict, function(req, res) {
    var id = req.body.id
    var pin = req.body.pin

    auth.disablePin(id, pin, function(err){
      if(err) return res.send(400, err)
      res.send(200)
    })
  })

  app.post('/location', function(req, res) {
    var data = req.body

    var lat = data.lat
    var lon = data.lon
    delete data.lat
    delete data.lon

    var id = req.session.tmpSessionID
    if(!id) {
      id = crypto.randomBytes(16).toString('base64')
      req.session.tmpSessionID = id
    }
    data.id = id
    geo.save(lat, lon, data, function(err, found) {
      if(err) return res.json(400, err)
      res.json(200, found)
    })
  })

  app.delete('/location', function(req, res) {
    geo.remove(req.session.tmpSessionID, function(err, found) {
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
        return res.send(400, {error: 'Bad request'})
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
    req.session.wallet_id = wallet_id
    callback()
  }

  function requireHTTPS(req, res, next) {
    var herokuForwardedFromHTTPS = req.headers['x-forwarded-proto'] === 'https'
    if (!herokuForwardedFromHTTPS && process.env.NODE_ENV === 'production') {
      return res.redirect('https://' + req.get('host') + req.url)
    }
    next()
  }
  return app
}

