'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var $ = require('browserify-zepto')
var confirmPassphrasePage = require('../create-confirm/index')

module.exports = function(){
  var words = Hive.getWallet().getMnemonic().split(' ')
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template
    },
    data: {
      passphrase_length: words.length,
      current_word: 0,
      passphrase_array: words,
      pass_next_text: 'Next word'
    }
  })

  var current_element = $(ractive.nodes['seed_word_' + 0])
  current_element.addClass('middle')
  ractive.pauseLoading()

  ractive.on('next-word', function() {
    var old_word = ractive.get('current_word')
    var length = ractive.get('passphrase_array').length
    var is_animating = ractive.get('passphrase_animating')

    if(is_animating){ return; }
    if(old_word === length - 1) {
      return confirmPassphrasePage();
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

  ractive.on('prev-word', function() {
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

  function animation_complete() {
    ractive.set('passphrase_animating', false)
  }

  return ractive
}
