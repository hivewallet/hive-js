'use strict';

var Ractive = require('ractify')
var openWallet = require('hive-wallet').openWallet
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true
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

  function onSyncDone(err) {
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
