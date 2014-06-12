'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var db = require('hive-db')
var satoshiToBtc = require('hive-convert').satoshiToBtc

module.exports = function(el){
  var nearbys = []
  var xhr_timeout, oval_interval;
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      exchangeRates: {},
      satoshiToBtc: satoshiToBtc,
      bitcoinToFiat: bitcoinToFiat
    }
  })

  emitter.on('wallet-ready', function(){
    db.get('systemInfo', function(err, info){
      if(err) return console.error(err);
      ractive.set('fiatCurrency', info.preferredCurrency)
    })
  })

  emitter.on('open-overlay', function(data){
    if(data.overlay === 'currency') {
      ractive.set('visible', true)
      ractive.set('bitcoinBalance', data.balance)
    }
  })

  ractive.on('cancel', function(){
    ractive.set('visible', false)
    emitter.emit('close-overlay')
  })

  emitter.on('preferred-currency-changed', function(currency){
    ractive.set('fiatCurrency', currency)
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  function bitcoinToFiat(amount, exchangeRate){
    if(amount == undefined) return;

    var btc = satoshiToBtc(amount)
    return (btc * exchangeRate).toFixed(2)
  }

  return ractive
}
