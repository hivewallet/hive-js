'use strict';

var Ractive = require('ractify')
var openWallet = require('hive-wallet').openWallet
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true,
      opening: false,
    },
    template: require('./index.ract')
  })

  ractive.on('open-wallet', function(event){
    event.original.preventDefault()
    openWallet(getPassphrase(), getNetwork(), onSyncDone, onTransactionsLoaded)
  })

  ractive.on('create-wallet', function(event){
    event.original.preventDefault()
    openWallet(null, getNetwork(), onSyncDone, onTransactionsLoaded)
  })

  emitter.on('wallet-opening', function(progress){
    ractive.set('opening', true)
    ractive.set('progress', progress)

    window.setInterval(function(){
      var text = ractive.get('progress')
      ractive.set('progress', text + '.')
    }, 500)
  })

  function onSyncDone(err) {
    ractive.set('opening', false)
    if(err) return alert("error synchronizing. " + err)

    emitter.emit('wallet-ready')
    ractive.set('visible', false)
    location.hash = '#profile'
  }

  function onTransactionsLoaded(err, transactions) {
    if(err) return alert("error loading transactions. " + err)

    emitter.emit('transactions-loaded', transactions)
  }

  function getPassphrase(){
    return ractive.get('passphrase').trim()
  }

  function getNetwork() {
    if(location.search.indexOf('testnet=true') > 0) {
      return 'testnet'
    }
  }

  return ractive
}
