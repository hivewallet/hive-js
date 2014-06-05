'use strict';

var Ractive = require('hive-ractive')
var Big = require('big.js')
var emitter = require('hive-emitter')
var db = require('hive-db')
var getWallet = require('hive-wallet').getWallet

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      exchangeRates: {}
    }
  })

  emitter.on('wallet-ready', function(){
    db.get('systemInfo', function(err, info){
      if(err) return console.error(err);
      ractive.set('fiatCurrency', info.preferredCurrency)
    })
  })

  emitter.on('clear-send-form', function(){
    ractive.set('to', '')
    ractive.set('value', '')
    ractive.set('fiatValue', '')
  })

  emitter.on('prefill-wallet', function(address) {
    ractive.set('to', address)
  })

  emitter.on('preferred-currency-changed', function(currency){
    ractive.set('fiatCurrency', currency)
    ractive.fire('bitcoin-to-fiat')
  })

  ractive.on('open-geo', function(){
    var data = {
      overlay: 'geo',
      context: 'send'
    }
    emitter.emit('open-overlay', data)
  })

  ractive.on('open-send', function(){

    var validated = validateSend()
    if(!validated) return;

    var data = {
      overlay: 'confirm',
      address: ractive.get('to'),
      amount: ractive.get('value')
    }
    emitter.emit('open-overlay', data)
  })

  ractive.on('fiat-to-bitcoin', function(){
    var fiat = ractive.nodes.fiat.value
    if(fiat == undefined || fiat === '') return;

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('fiatCurrency')]
    var bitcoin = new Big(fiat).div(exchangeRate).toFixed(8)

    ractive.set('value', bitcoin)
  })

  ractive.on('bitcoin-to-fiat', function(){
    var bitcoin = ractive.nodes.bitcoin.value
    if(bitcoin == undefined || bitcoin === '') return;

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('fiatCurrency')]
    var fiat = new Big(bitcoin).times(exchangeRate).toFixed(2)

    ractive.set('fiatValue', fiat)
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  function validateSend() {
    var amount = ractive.get('value')
    var address = ractive.get('to')
    var wallet = getWallet()
    var balance = wallet.getBalance() - bitcoinToSatoshi(0.0001)

    if(address === '' || address === undefined) {

      var data = {
        message: "Please enter an address to send to."
      }
      emitter.emit('open-error', data)

      return false
    }

    if(amount === undefined) {

      var data = {
        message: 'Please enter an amount to send.'
      }
      emitter.emit('open-error', data)

      return false
    }

    amount = bitcoinToSatoshi(amount)

    if(amount > balance) {

      var data = {
        title: 'Uh oh!',
        message: "You don't have enough funds in your wallet."
      }
      emitter.emit('open-error', data)

      return false
    }

    return true;
  }

  function onTxSent(err, tx){
    if(err) {
      emitter.emit('open-error', { message: "error sending transaction. " + err })
      return;
    }

    // update balance & tx history
    emitter.emit('wallet-ready')
    emitter.emit('transactions-loaded', [tx])
  }

  function bitcoinToSatoshi(amount){
    var btc = new Big(amount)
    return parseInt(btc.times(100000000).toFixed(0))
  }

  return ractive
}
