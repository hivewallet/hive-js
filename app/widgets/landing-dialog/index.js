'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')

var timerId = null

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true,
      opening: false,
      enterPin: false
    },
    template: require('./index.ract')
  })

  ractive.on('open-wallet', function(event){
    event.original.preventDefault()
    Hive.openWallet(getPassphrase(), getNetwork(), onSyncDone, onTransactionsLoaded)
  })

  ractive.on('create-wallet', function(event){
    event.original.preventDefault()
    Hive.createWallet(onWalletCreated, getNetwork())
  })

  ractive.on('set-pin', function(event){
    Hive.setPin(ractive.get('pin'), onSyncDone)
  })

  emitter.on('wallet-opening', function(progress){
    ractive.set('opening', true)
    ractive.set('progress', progress)

    loading()
  })

  function onWalletCreated() {
    pauseLoading()
    ractive.set('progress', 'Please set a pin for quick wallet access')
    ractive.set('enterPin', true)
  }

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

  function loading() {
    timerId = setInterval(function(){
      var text = ractive.get('progress')
      ractive.set('progress', text + '.')
    }, 500)
  }

  function pauseLoading() {
    clearInterval(timerId)
    timerId = null
  }

  return ractive
}
