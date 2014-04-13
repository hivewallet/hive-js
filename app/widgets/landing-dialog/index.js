'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')

var timerId = null

function register(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true,
      opening: false,
      setPin: false
    },
    template: require('./register.ract')
  })

  includeSharedBehaviors(ractive)

  ractive.on('open-wallet', function(event){
    event.original.preventDefault()
    Hive.openWallet(getPassphrase(), ractive.getNetwork(),
                    ractive.onSyncDone, ractive.onTransactionsLoaded)
  })

  ractive.on('create-wallet', function(event){
    event.original.preventDefault()
    Hive.createWallet(onWalletCreated, ractive.getNetwork())
  })

  ractive.on('set-pin', function(event){
    Hive.setPin(ractive.get('pin'), ractive.onSyncDone)
  })

  function onWalletCreated() {
    ractive.pauseLoading()
    ractive.set('progress', 'Please set a pin for quick wallet access')
    ractive.set('setPin', true)
  }

  function getPassphrase(){
    return ractive.get('passphrase').trim()
  }

  return ractive
}

function login(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true,
      opening: false
    },
    template: require('./login.ract')
  })

  includeSharedBehaviors(ractive)

  ractive.on('open-wallet-with-pin', function(event){
    event.original.preventDefault()
    Hive.openWalletWithPin(getPin(), ractive.getNetwork(),
                    ractive.onSyncDone, ractive.onTransactionsLoaded)
  })

  function getPin(){
    return ractive.get('pin')
  }

  return ractive
}


function includeSharedBehaviors(ractive) {
  emitter.on('wallet-opening', function(progress){
    ractive.set('opening', true)
    ractive.set('progress', progress)

    loading()
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

  ractive.onSyncDone = onSyncDone
  ractive.onTransactionsLoaded = onTransactionsLoaded
  ractive.getNetwork = getNetwork
  ractive.loading = loading
  ractive.pauseLoading = pauseLoading
}

module.exports = {
  login: login,
  register: register
}
