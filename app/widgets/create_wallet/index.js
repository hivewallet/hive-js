'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var $ = require('browserify-zepto')
var fastclick = require('fastclick')
var arrival = require('arrival')
var hasher = require('hive-router').hasher

module.exports = function (el){
  var ractive = new Ractive({
    el: el,
    data: {
      passphrase_array: [],
      create_intro: true,
      create_read: false,
      create_confirm: false,
      create_pin: false,
      passphrase_pending: true,
      passphrase_animating: false,
      pass_next_text: 'Next word'
    },
    template: require('./index.ract').template
  })

  ractive.on('temp-back', function(event){
    event.original.preventDefault()
    ractive.set('createWallet', false)
  })

  ractive.on('generate-phrase', function(event){
    event.original.preventDefault()
    ractive.set('create_intro', false)
    ractive.set('create_read', true)
    Hive.createWallet(null, getNetwork(), onSeedCreated)
  })

  ractive.on('next-word', function(event) {

    event.original.preventDefault()
    var old_word = ractive.get('current_word')
    var length = ractive.get('passphrase_array').length
    var is_animating = ractive.get('passphrase_animating')

    if(is_animating){ return; }
    if(old_word === length - 1) {
      ractive.set('create_read', false)
      ractive.set('create_confirm', true)
      return;
    }
    if(old_word === length - 2) {
      ractive.set('pass_next_text', 'Review Passphrase')
    }

    ractive.set('passphrase_animating', true)

    var new_word = old_word + 1
    var old_element = $(ractive.nodes['seed_word_' + old_word])
    var new_element = $(ractive.nodes['seed_word_' + new_word])

    ractive.set('current_word', new_word)
    old_element.addClass('left')
    new_element.addClass('middle')

    // arrival(ractive.nodes.pass_words, animation_complete)
    setTimeout(animation_complete, 400)
  })

  ractive.on('prev-word', function(event) {

    event.original.preventDefault()
    var old_word = ractive.get('current_word')
    var length = ractive.get('passphrase_array').length
    var is_animating = ractive.get('passphrase_animating')

    if(old_word === 0 || is_animating){ return; }
    if(old_word === length - 1) {
      ractive.set('pass_next_text', 'Next word')
    }

    ractive.set('passphrase_animating', true)

    var new_word = old_word - 1;
    var old_element = $(ractive.nodes['seed_word_' + old_word])
    var new_element = $(ractive.nodes['seed_word_' + new_word])

    ractive.set('current_word', new_word)
    old_element.removeClass('middle')
    new_element.removeClass('left')

    // arrival(ractive.nodes.pass_words, animation_complete)
    setTimeout(animation_complete, 400)
  })


  ractive.on('create-pin', function(event) {
    event.original.preventDefault()
    ractive.set('create_confirm', false)
    ractive.set('create_pin', true)
  })

  ractive.on('set-pin', function(event) {
    event.original.preventDefault()
    Hive.setPin(ractive.get('pin'), onSyncDone)
  })


  function animation_complete() {
    ractive.set('passphrase_animating', false)
  }

  function getNetwork() {
    if(location.search.indexOf('testnet=true') > 0) {
      return 'testnet'
    }
  }

  function onSeedCreated() {
    var wallet = Hive.getWallet()
    var string = wallet.getMnemonic()
    var array = string.split(' ')
    ractive.set('passphrase', string)
    ractive.set('passphrase_length', array.length)
    ractive.set('current_word', 0)
    ractive.set('passphrase_pending', false)
    ractive.set('passphrase_array', array)

    var current_element = $(ractive.nodes['seed_word_' + 0])
    current_element.addClass('middle')

    $(ractive.findAll('.attach_fastclick')).each(function(){
      fastclick(this);
    });
  }

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


  return ractive
}

