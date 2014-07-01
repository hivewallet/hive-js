'use strict';

var Ractive = require('hive-ractive')
var Big = require('big.js')
var emitter = require('hive-emitter')
var db = require('hive-db')
var getWallet = require('hive-wallet').getWallet
var estimateTotalFee = require('hive-wallet').estimateTotalFee
var currencies = require('hive-ticker-api').currencies
var btcToSatoshi = require('hive-convert').btcToSatoshi
var satoshiToBtc = require('hive-convert').satoshiToBtc
var toFixedFloor = require('hive-convert').toFixedFloor
var showError = require('hive-flash-modal').showError
var showInfo = require('hive-flash-modal').showInfo
var showConfirmation = require('hive-confirm-overlay')
var validateAddress = require('hive-wallet').validateSend

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

    validateSend(function(err, tx){
      if(err) {
        if(err.message.match(/trying to empty your wallet/)){
          ractive.set('value', getSendableBalance())
          return showInfo({message: err.message})
        }
        return showError({title: 'Uh oh!', message: err.message});
      }
      var network = getWallet().getMasterKey().network
      var fee = network.estimateFee(tx)

      showConfirmation({
        to: ractive.get('to'),
        amount: ractive.get('value'),
        denomination: ractive.get('denomination'),
        fee: satoshiToBtc(fee)
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

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('selectedFiat')]
    var bitcoin = toFixedFloor(new Big(fiat).div(exchangeRate), 8)

    ractive.set('value', bitcoin)
  })

  ractive.on('bitcoin-to-fiat', function(){
    var bitcoin = ractive.nodes.bitcoin.value
    if(bitcoin == undefined || bitcoin === '') return;


    var exchangeRate = ractive.get('exchangeRates')[ractive.get('selectedFiat')]
    var val = new Big(bitcoin).times(exchangeRate)
    var fiat = toFixedFloor(val, 2)

    ractive.set('fiatValue', fiat)
  })

  function validateSend(callback) {
    var amount = btcToSatoshi(ractive.get('value'))
    var address = ractive.get('to')
    var wallet = getWallet()
    var balance = wallet.getBalance()
    var network = wallet.getMasterKey().network
    var tx = null

    validateAddress(wallet, address, amount, function(err){
      if(err) return callback(err);

      try {
        tx = wallet.createTx(address, amount)
      } catch(e) {
        var message = e.message
        var userMessage = message

        if(message.match(/dust threshold/)) {
          userMessage = 'Please an amount above ' + satoshiToBtc(network.dustThreshold)
        } else if(message.match(/Not enough funds/)) {
          if(attemptToEmptyWallet()){
            var sendableBalance = getSendableBalance()
            userMessage = [
              "It seems like you are trying to empty your wallet.",
              "Taking transaction fee into account, we estimated that the max amount you can send is",
              sendableBalance + ".",
              "We have amended the value in the amount field for you."
            ].join(' ')
          } else {
            userMessage = "You don't have enough funds in your wallet."
          }
        } else {
          return callback(e)
        }
        return callback(new Error(userMessage))
      }

      callback(null, tx)
    })

    function attemptToEmptyWallet(){
      return amount === balance ||
        toFixedFloor(amount / 10000, 0) === toFixedFloor(balance / 10000, 0)
    }
  }

  function getSendableBalance(){
    return satoshiToBtc(getWallet().getBalance() - estimateTotalFee())
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
