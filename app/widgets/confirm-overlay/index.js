'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')
var getWallet = require('hive-wallet').getWallet
var btcToSatoshi = require('hive-convert').btcToSatoshi

function open(data){

  data.confirmation = true

  var ractive = new Ractive({
    el: document.getElementById('confirm-overlay'),
    template: require('./index.ract').template,
    data: data
  })

  ractive.on('clear', function() {
    ractive.fire('cancel')
    emitter.emit('clear-send-form')
  })

  ractive.on('send', function(){
    var to = ractive.get('to')
    var value = btcToSatoshi(ractive.get('amount'))
    var wallet = getWallet()

    wallet.createTxAsync(to, value, function(err, tx){
      if(err) return handleTransactionError()
      wallet.sendTx(tx, onTxSent)
    })
  })

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

module.exports = open
