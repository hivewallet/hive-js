'use strict';

var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var landingDialog = require('./widgets/landing-dialog')
var profile = require('./pages/profile')
// var apps = require('./pages/apps')
var transactions = require('./pages/transactions')
var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')

menu(document.getElementById("sidebar"))
profile(document.getElementById("profile"))
// apps(document.getElementById("apps"))
transactions(document.getElementById("transactions"))
sendDialog(document.getElementById("send-dialog"))
landingDialog(document.getElementById("landing-dialog"))


function updateExchangeRates(){
  var tickerUpdateInterval = 1000 * 60 * 2
  var ticker = new Ticker()

  ticker.getExchangeRates(function(err, rates){
    emitter.emit('ticker', rates)
    window.setTimeout(updateExchangeRates, tickerUpdateInterval)
  })
}

updateExchangeRates()
