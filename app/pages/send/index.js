'use strict';

var Ractive = require('hive-ractive')
var Big = require('big.js')
var emitter = require('hive-emitter')
var db = require('hive-db')
var getWallet = require('hive-wallet').getWallet
var currencies = require('hive-ticker-api').currencies
var toFixedFloor = require('hive-convert').toFixedFloor
var showError = require('hive-modal-flash').showError
var showInfo = require('hive-modal-flash').showInfo
var showConfirmation = require('hive-modal-confirm-send')
var validateSend = require('hive-wallet').validateSend

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      currencies: currencies,
      exchangeRates: {}
    }
  })

  emitter.on('clear-send-form', function(){
    ractive.set('to', '')
    ractive.set('value', '')
    ractive.set('fiatValue', '')
  })

  emitter.on('prefill-wallet', function(address) {
    ractive.set('to', address)
  })

  ractive.on('open-geo', function(){
    var data = {
      overlay: 'geo',
      context: 'send'
    }
    emitter.emit('open-overlay', data)
  })

  emitter.on('send-confirm-open', function() {
    ractive.set('validating', false)
  })

  ractive.on('open-send', function(){
    var to = ractive.get('to')
    var amount = ractive.get('value')

    validateSend(getWallet(), to, amount, function(err, fee){
      if(err) {
        var interpolations = err.interpolations
        if(err.message.match(/trying to empty your wallet/)){
          ractive.set('value', interpolations.sendableBalance)
          return showInfo({message: err.message, interpolations: interpolations})
        }
        return showError({title: 'Uh Oh...', message: err.message, href: err.href, linkText: err.linkText, interpolations: interpolations})
      }

      showConfirmation({
        to: to,
        amount: ractive.get('value'), // don't change this to amount. 'value' could be modified above
        denomination: ractive.get('denomination'),
        fee: fee
      })
    })
  })

  emitter.on('wallet-ready', function(){
    ractive.set('denomination', getWallet().denomination)
  })

  emitter.on('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('selectedFiat', doc.systemInfo.preferredCurrency)
    })
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.observe('selectedFiat', setPreferredCurrency)

  ractive.on('fiat-to-bitcoin', function(){
    var fiat = ractive.nodes.fiat.value
    if(fiat == undefined || fiat === '') return;

    var exchangeRate = getExchangeRate()
    if(!exchangeRate) return;

    var bitcoin = toFixedFloor(new Big(fiat).div(exchangeRate), 8)

    ractive.set('value', bitcoin)
  })

  ractive.on('bitcoin-to-fiat', function(){
    var bitcoin = ractive.nodes.bitcoin.value
    if(bitcoin == undefined || bitcoin === '') return;


    var exchangeRate = getExchangeRate()
    if(!exchangeRate) return;

    var val = new Big(bitcoin).times(exchangeRate)
    var fiat = toFixedFloor(val, 2)

    ractive.set('fiatValue', fiat)
  })

  ractive.observe('to', function() {
    if(ractive.nodes.to.value.length === 0) {
      ractive.set('toEntered', false)
    } else {
      ractive.set('toEntered', true)
    }
  })

  ractive.on('clearTo', function(){
    var passfield = ractive.nodes.to
    ractive.set('to', '')
    ractive.set('toEntered', false)
    passfield.focus()
  })

  ractive.on('focusAmountInput', function(event) {
    event.node.parentNode.style.zIndex = 5000
  })

  ractive.on('blurAmountInput', function(event) {
    event.node.parentNode.style.zIndex = ''
  })

  function getExchangeRate(){
    var exchangeRate = ractive.get('exchangeRates')[ractive.get('selectedFiat')]
    ractive.set("exchangeRateUnavailable", exchangeRate == undefined)
    return exchangeRate
  }

  function setPreferredCurrency(currency, old){
    if(old == undefined) return; //when loading wallet

    db.set('systemInfo', {preferredCurrency: currency}, function(err, response){
      if(err) return console.error(response);

      emitter.emit('preferred-currency-changed', currency)
      ractive.fire('bitcoin-to-fiat')
    })
  }

  return ractive
}
