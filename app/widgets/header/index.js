'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var sync = require('hive-wallet').sync
var getWallet = require('hive-wallet').getWallet
var satoshiToBtc = require('hive-convert').satoshiToBtc
var toFixedFloor = require('hive-convert').toFixedFloor
var Big = require('big.js')
var showError = require('hive-modal-flash').showError
var db = require('hive-db')
var spinner = require('hive-transitions/spinner.js')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      satoshiToBtc: satoshiToBtc,
      menuOpen: false,
      exchangeRates: {},
      bitcoinToFiat: bitcoinToFiat,
      cropBalance: function(amount) {
        if(amount > 0.0001) {
          return toFixedFloor(amount, 4)
        } else {
          return amount
        }
      }
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet();
    ractive.set('bitcoinBalance', wallet.getBalance())
    ractive.set('denomination', wallet.denomination)
    db.get('systemInfo', function(err, info){
      if(err) return console.error(err);
      ractive.set('fiatCurrency', info.preferredCurrency)
    })
  })

  emitter.on('update-balance', function() {
    var wallet = getWallet();
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  ractive.on('toggle', function(){
    window.scrollTo(0, 0);
    emitter.emit('toggle-menu', !ractive.get('menuOpen'))
  })

  function toggleIcon(open){
    ractive.set('menuOpen', open)
  }

  var refreshEl = ractive.nodes.refresh_el

  function cancelSpinner() {
    ractive.set('updating_transactions', false)
    spinner.stop(refreshEl)
  }

  ractive.on('sync', function(event){
    event.original.preventDefault();
    if(!ractive.get('updating_transactions')) {
      ractive.set('updating_transactions', true)
      spinner.spin(refreshEl)
      setTimeout(cancelSpinner, 30000)
      sync(function(err, txs){
        if(err) return showError(err)
        cancelSpinner()
        emitter.emit('update-balance')
        emitter.emit('update-transactions', txs)
      })
    }
  })

  ractive.on('toggle-currencies', function(){
    if(ractive.get('showFiat')) {
      ractive.set('showFiat', false)
    } else {
      ractive.set('showFiat', true)
    }
  })

  emitter.on('preferred-currency-changed', function(currency){
    ractive.set('fiatCurrency', currency)
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  function bitcoinToFiat(amount, exchangeRate) {
    if(amount == undefined || exchangeRate == undefined) return "N/A";

    var btc = satoshiToBtc(amount)
    return new Big(exchangeRate).times(btc).toFixed(2)
  }

  ractive.toggleIcon = toggleIcon

  return ractive
}
