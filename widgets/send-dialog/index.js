'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')
var getWallet = require('hive-wallet').getWallet
var Big = require('big.js')
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  })

  ractive.on('cancel', function(event){
    if($(event.original.srcElement).hasClass('modal-cancel')) {
      ractive.set('visible', false)
    }
  })

  ractive.on('open', function(event){
    ractive.set('visible', true)
  })

  ractive.on('send', function(event){
    ractive.set('visible', false)
    var to = ractive.get('to')
    var value = btcToSatoshi(ractive.get('value'))

    var wallet = getWallet()

    wallet.createTxAsync(to, value, function(err, tx){
      if(err) return alert(err)

      wallet.sendTx(tx, onTxSent)
    })
  })

  function btcToSatoshi(amount){
    var btc = new Big(amount)
    return parseInt(btc.times(100000000).toFixed(0))
  }

  function onTxSent(err, transaction){
    if(err) return alert("error sending transaction. " + err)

    // update balance & tx history
    emitter.emit('wallet-ready')
    emitter.emit('transactions-loaded', [transaction])
  }

  return ractive
}
