'use strict';

var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var walletExists = require('hive-wallet').walletExists
var fastclick = require('fastclick')
var initFrame = require('hive-frame')
var initAuth = require('hive-auth')
var showError = require('hive-flash-modal').showError
var initGeoOverlay = require('hive-geo-overlay')
var $ = require('browserify-zepto')

var appEl = document.getElementById('app')
var frame = initFrame(appEl)
var auth = null
var _html = $('html')
var _app = $(appEl)

fastclick(document.body)

initGeoOverlay(document.getElementById('geo-overlay'))

walletExists(function(exists){
  auth = exists ? initAuth.pin(null, { userExists: true }) : initAuth.choose()
  auth.show()
})

emitter.on('open-overlay', function(){
  _app.addClass('is_hidden')
  _html.addClass('prevent_scroll')
})

emitter.on('close-overlay', function(){
  _app.removeClass('is_hidden')
  _html.removeClass('prevent_scroll')
})

emitter.on('wallet-ready', function(){
  auth.hide()
  frame.show()
})

function updateExchangeRates(){
  var tickerUpdateInterval = 1000 * 60 * 2
  var ticker = new Ticker()

  ticker.getExchangeRates(function(err, rates){
    if(rates) emitter.emit('ticker', rates)
    window.setTimeout(updateExchangeRates, tickerUpdateInterval)
  })
}

updateExchangeRates()

// inline reload script because gulp stooged it
if(process.env.NODE_ENV !== "production") {
  document.write('<script src="' + (location.protocol || 'http:') + '//' + (location.hostname || 'localhost') + ':35729/livereload.js?snipver=1" type="text/javascript"><\/script>')
}

