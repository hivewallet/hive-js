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
      exchangeRates: {}
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
      ractive.set('balance', data.balance)
      ractive.fire('bitcoin-to-fiat')
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

  ractive.on('bitcoin-to-fiat', function(){
    var bitcoin = ractive.get('balance')
    if(bitcoin == undefined || bitcoin === '') return;

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('fiatCurrency')]
    var fiat = new Big(bitcoin).times(exchangeRate).toFixed(2)

    ractive.set('fiatValue', fiat)
  })

  return ractive
}
