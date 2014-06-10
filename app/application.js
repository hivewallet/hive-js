'use strict';

var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var walletExists = require('hive-wallet').walletExists
var fastclick = require('fastclick')
var initFrame = require('hive-frame')
var initAuth = require('hive-auth')
var initFlashModal = require('hive-flash-modal')
var initGeoOverlay = require('hive-geo-overlay')
var initConfirmOverlay = require('hive-confirm-overlay')
var initCurrencyOverlay = require('hive-currency-overlay')
var $ = require('browserify-zepto')

var appEl = document.getElementById('app')
var frame = initFrame(appEl)
var auth = null
var _html = $('html')
var _app = $(appEl)

fastclick(document.getElementsByTagName("body")[0])

initFlashModal(document.getElementById('flash-modal'))
initGeoOverlay(document.getElementById('geo-overlay'))
initConfirmOverlay(document.getElementById('confirm-overlay'))
initCurrencyOverlay(document.getElementById('currency-overlay'))

// test for localStorage & private browser mode
require('browsernizr/test/storage/localstorage')
var Modernizr = require('browsernizr')
if(!Modernizr.localstorage) {
  emitter.emit('open-error', {
    message: 'Your browser does not support localStorage, try switching to public mode'
  })
}

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

emitter.on('open-disable-pin', function(){
  initAuth.disablePin()
  frame.hide()
  auth.show()
})

emitter.on('close-disable-pin', function(){
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



