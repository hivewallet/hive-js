'use strict';

var xhr = require('xhr')
var currencies = require('./currencies')

function BitcoinAverage(testnet){
  if(testnet) throw new Error("testnet not supported")
}
BitcoinAverage.apiRoot = "https://api.bitcoinaverage.com/ticker/"

function getExchangeRates(callback){
  var uri = BitcoinAverage.apiRoot + "global/all"
  xhr({
    uri: uri,
    method: 'GET'
  }, function(err, resp, body){
    if(resp.statusCode !== 200) {
      console.error(body)
      return callback(err)
    }

    callback(null, toRates(JSON.parse(body)))
  })
}

function toRates(apiRates){
  var rates = {}
  currencies.forEach(function(currency){
    rates[currency] = apiRates[currency].last
  })

  return rates
}

BitcoinAverage.prototype.getExchangeRates = getExchangeRates
module.exports = BitcoinAverage
