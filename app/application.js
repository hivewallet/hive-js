'use strict';

// remove hash to avoid router bugs
if (location.hash) {
  var loc = window.location
  if ("pushState" in history) {
      history.pushState("", document.title, loc.pathname + loc.search)
  }
}

var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var initFrame = require('hive-frame')
var initAuth = require('hive-auth')
var walletExists = require('hive-wallet').walletExists
var fastclick = require('fastclick')

fastclick(document.getElementsByTagName("body")[0])

var frame = initFrame(document.getElementById('app'))
var authEl = document.getElementById("auth")
var auth = null

walletExists(function(exists){
  auth = initAuth()
  // auth = exists ? initAuth.login(authEl) : initAuth.register(authEl)
  auth.show()
})

emitter.on('wallet-ready', function(){
  auth.hide()
  frame.show()
})

function updateExchangeRates(){
  var tickerUpdateInterval = 1000 * 60 * 2
  var ticker = new Ticker()

  ticker.getExchangeRates(function(err, rates){
    emitter.emit('ticker', rates)
    window.setTimeout(updateExchangeRates, tickerUpdateInterval)
  })
}

updateExchangeRates()



