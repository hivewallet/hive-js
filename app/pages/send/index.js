'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var Big = require('big.js')
var emitter = require('hive-emitter')
var db = require('hive-db')

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

  emitter.on('prefill-wallet', function(address) {
    ractive.set('to', address)
  })

  ractive.on('open-geo', function(){
    emitter.emit('open-overlay', 'geo')
  })

  ractive.on('send', function(event){
    var to = ractive.get('to')
    var value = bitcoinToSatoshi(ractive.get('value'))

    var wallet = getWallet()

    wallet.createTxAsync(to, value, function(err, tx){
      if(err) return alert(err)
      wallet.sendTx(tx, onTxSent)
    })
  })

  ractive.on('fiat-to-bitcoin', function(event){
    var fiat = event.node.value
    if(fiat === '') return;

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('fiatCurrency')]
    var bitcoin = new Big(fiat).div(exchangeRate).toFixed(8)

    ractive.set('value', bitcoin)
  })

  ractive.on('bitcoin-to-fiat', function(event){
    var bitcoin = event.node.value
    if(bitcoin === '') return;

    var exchangeRate = ractive.get('exchangeRates')[ractive.get('fiatCurrency')]
    var fiat = new Big(bitcoin).times(exchangeRate).toFixed(2)

    ractive.set('fiatValue', fiat)
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  function bitcoinToSatoshi(amount){
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
