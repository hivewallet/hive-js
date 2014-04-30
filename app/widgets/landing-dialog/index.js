'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var router = require('hive-router').router

var timerId = null

function register(el){
  var ractive = new Ractive({
    el: el,
    data: {
      visible: true,
      opening: false,
      newUser: true,
      setPin: false
    },
    template: require('./register.ract')
  })

  includeSharedBehaviors(ractive)

  ractive.on('open-wallet-with-passphrase', function(event){
    event.original.preventDefault()
    Hive.createWallet(getPassphrase(), ractive.getNetwork(), onWalletCreated)
  })

  ractive.on('reveal-passphrase-input', function(event){
    event.original.preventDefault()
    ractive.set('newUser', false);
    ractive.nodes.passphraseField.focus();
  })

  ractive.on('hide-passphrase-input', function(event){
    event.original.preventDefault()
    ractive.set('newUser', true);
  })

  ractive.on('create-wallet', function(event){
    event.original.preventDefault()
    Hive.createWallet(null, ractive.getNetwork(), onWalletCreated)
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

  ractive.on('clear-credentials', function(event){
    event.original.preventDefault()
    Hive.reset(function(err){
      location.reload(false);
    })
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
    if(err) {
      if(err === 'user_deleted') return location.reload(false);
      return alert("error synchronizing. " + err)
    }

    emitter.emit('wallet-ready')
    ractive.set('visible', false)
    router.parse('/profile')
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
