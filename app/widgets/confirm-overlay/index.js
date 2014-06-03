'use strict';

var Ractive = require('hive-ractive')
var transitions = require('hive-transitions')
var emitter = require('hive-emitter')
var Big = require('big.js')
var getWallet = require('hive-wallet').getWallet

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
      confirmation: true
    }
  })

  emitter.on('open-overlay', function(data){
    if(data.overlay === 'confirm') {
      ractive.set('visible', true)
      ractive.set('amount', data.amount)
      ractive.set('address', data.address)
    }
  })

  ractive.on('cancel', function(){
    ractive.set('visible', false)
    ractive.set('confirmation', true)
    ractive.set('success', false)
    ractive.set('error', false)
    emitter.emit('close-overlay')
  })

  ractive.on('clear', function() {
    ractive.fire('cancel')
    emitter.emit('clear-send-form')
  })

  ractive.on('send', function(){
    var to = ractive.get('address')
    var value = bitcoinToSatoshi(ractive.get('amount'))
    var wallet = getWallet()

    wallet.createTxAsync(to, value, function(err, tx){
      if(err) return alert(err)
      wallet.sendTx(tx, onTxSent)
    })
  })

  function bitcoinToSatoshi(amount){
    var btc = new Big(amount)
    return parseInt(btc.times(100000000).toFixed(0))
  }

  function onTxSent(err, transaction){
    if(err) return handleTransactionError()

    ractive.set('confirmation', false)
    ractive.set('success', true)
    // update balance & tx history
    emitter.emit('wallet-ready')
    emitter.emit('transactions-loaded', [transaction])
  }

  function handleTransactionError() {
    ractive.set('confirmation', false)
    ractive.set('error', true)
  }

  return ractive
}
