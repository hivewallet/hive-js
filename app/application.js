'use strict';

// remove hash to avoid router bugs
if (location.hash) {
  var loc = window.location
  if ("pushState" in history) {
      history.pushState("", document.title, loc.pathname + loc.search)
  }
}

var $ = require('browserify-zepto')
var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var frame = require('hive-frame')

frame(document.getElementById('app'))

function updateExchangeRates(){
  var tickerUpdateInterval = 1000 * 60 * 2
  var ticker = new Ticker()

  ticker.getExchangeRates(function(err, rates){
    emitter.emit('ticker', rates)
    window.setTimeout(updateExchangeRates, tickerUpdateInterval)
  })
}

updateExchangeRates()



