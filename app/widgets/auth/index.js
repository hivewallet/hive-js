'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var router = require('hive-router').router
var hasher = require('hive-router').hasher
var $ = require('browserify-zepto')
var fastclick = require('fastclick')

var timerId = null

function register(el){
  var ractive = new Ractive({
    el: el,
    data: {
      opening: false,
      newUser: true,
      setPin: false,
      setPassphrase: false,
      passphrase_array: [],
      pass_intro: true,
      pass_read: false,
      pass_confirm: false,
      passphrase_pending: true
    },
    template: require('./auth_register.ract').template
  })

  includeSharedBehaviors(ractive)

  ractive.on('prepare-seed', function(event){
    event.original.preventDefault()
    ractive.set('setPassphrase', true)
  })

  ractive.on('temp-back', function(event){
    event.original.preventDefault()
    ractive.set('setPassphrase', false)
  })

  ractive.on('generate-phrase', function(event){
    event.original.preventDefault()
    ractive.set('pass_intro', false)
    ractive.set('pass_read', true)
    // Hive.createWallet(null, ractive.getNetwork(), onSeedCreated)

    onSeedCreated();
  })

  function onSeedCreated() {
    //var wallet = Hive.getWallet()
    //var string = wallet.getMnemonic()
    var string = 'sausage rib various tip various tip acquire replace state length kind near'
    var array = string.split(' ')
    ractive.set('passphrase_length', array.length)
    ractive.set('current_word', 0)
    ractive.set('passphrase_pending', false)
    ractive.set('passphrase_array', array)

    var current_element = $(ractive.nodes['seed_word_' + 0])
    current_element.addClass('middle')

    $(ractive.findAll('.attach_fastclick')).each(function(){
      fastclick(this);
    });

    var width = 100 / array.length;
    var element = ractive.nodes.progress_bar;

    // ractive.animate(element, 'width', {})
  }

  ractive.on('next-word', function(event) {
    event.original.preventDefault()

    var old_word = ractive.get('current_word')
    var length = ractive.get('passphrase_array').length

    if(old_word === length - 1){ return; }

    var new_word = old_word + 1;

    ractive.set('current_word', new_word)

    var old_element = $(ractive.nodes['seed_word_' + old_word])
    var new_element = $(ractive.nodes['seed_word_' + new_word])
    old_element.addClass('left')
    new_element.addClass('middle')
  })

  ractive.on('prev-word', function(event) {
    event.original.preventDefault()
    
    var old_word = ractive.get('current_word')

    if(old_word === 0){ return; }

    var new_word = old_word - 1;

    ractive.set('current_word', new_word)

    var old_element = $(ractive.nodes['seed_word_' + old_word])
    var new_element = $(ractive.nodes['seed_word_' + new_word])
    old_element.removeClass('middle')
    new_element.removeClass('left')
  })



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
    ractive.set('progress', 'Saving pin...')
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
