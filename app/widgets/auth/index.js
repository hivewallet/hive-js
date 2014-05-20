'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var createView = require('hive-create_wallet')
var router = require('hive-router').router
var hasher = require('hive-router').hasher
var $ = require('browserify-zepto')
var fastclick = require('fastclick')
var arrival = require('arrival')

var timerId = null

function register(el){
  var ractive = new Ractive({
    el: el,
    data: {
      opening: false,
      newUser: true,
      enterPin: false,
      createWallet: false,
      passphrase_array: [],
      create_intro: true,
      create_read: false,
      create_confirm: false,
      create_pin: false,
      passphrase_pending: true,
      passphrase_animating: false,
      pass_next_text: 'Next word'
    },
    template: require('./auth_register.ract').template
  })

  includeSharedBehaviors(ractive)

  var createEl = createView(ractive.nodes.create_wallet)
  var landingEl = $(ractive.nodes.landing_el)

  ractive.on('create-new-wallet', function(event){
    event.original.preventDefault()
    landingEl.removeClass('current')
    createEl.show()
  })

  function onWalletCreated() {
    ractive.pauseLoading()
    ractive.set('progress', 'Please set a pin for quick access')
    ractive.set('enterPin', true)
    ractive.nodes.setPin.focus()
  }
  
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

  emitter.on('set-pin', function(){

    Hive.setPin(ractive.get('pin'), ractive.onSyncDone)
    ractive.set('progress', 'Saving pin...')
    createEl.hide()
    landingEl.addClass('current')
  })

  function getPassphrase(){
    return ractive.get('passphrase').trim()
  }

  return ractive
}

function login(el){
  var ractive = new Ractive({
    el: el,
    data: {
      opening: false
    },
    template: require('./auth_login.ract').template
  })

  includeSharedBehaviors(ractive)

  ractive.on('open-wallet-with-pin', function(event){
    event.original.preventDefault()
    ractive.set('opening', true)
    ractive.set('progress', 'Checking PIN...')
    Hive.openWalletWithPin(getPin(), ractive.getNetwork(), ractive.onSyncDone)
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
    ractive.set('progress', progress)
    loading()
  })

  function onSyncDone(err, transactions) {
    ractive.set('opening', false)
    if(err) {
      if(err === 'user_deleted') return location.reload(false);
      return alert("error synchronizing. " + err)
    }

    hasher.setHash('#home');
    emitter.emit('wallet-ready')
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
  ractive.getNetwork = getNetwork
  ractive.loading = loading
  ractive.pauseLoading = pauseLoading
}

module.exports = {
  login: login,
  register: register
}
