'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var transitions = require('hive-transitions')
var emitter = require('hive-emitter')
var Big = require('big.js')
var db = require('hive-db')

Ractive.transitions.fade = transitions.fade;

module.exports = function(el){
  var nearbys = []
  var xhr_timeout, oval_interval;
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      transitions: {
        fade: transitions.fade
      },
      exchangeRates: {},
      satoshiToBTC: satoshiToBTC,
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

  function satoshiToBTC(amount){
    if(amount == undefined) return;

    var satoshi = new Big(amount)
    return satoshi.times(0.00000001)
  }

  function bitcoinToFiat(amount, exchangeRate){
    if(amount == undefined) return;

    var btc = satoshiToBTC(amount)
    return btc.times(exchangeRate).toFixed(2)
  }

  return ractive
}
