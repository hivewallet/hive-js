'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var validatePin = require('hive-pin-validator')
var showError = require('hive-flash-modal').showError

module.exports = function(prevPage, data){
  data = data || {}
  var userExists = data.userExists

  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
    },
    data: {
      userExists: userExists,
      pinLength: 0,
      boxes: [
        {dot: false},
        {dot: false},
        {dot: false},
        {dot: false}
      ]
    }
  })

  ractive.on('focus-pin', function(){
    ractive.set('pinfocused', true)
  })

  ractive.on('blur-pin', function(){
    ractive.set('pinfocused', false)
  })

  ractive.observe('pin', function(){
    var val = ractive.nodes['setPin'].value
    var new_length = val.length
    var old_length = ractive.get('pinLength')
    var boxes = ractive.get('boxes')

    if(new_length === old_length) return;

    if(new_length > old_length) {
      boxes[new_length - 1].dot = true
      ractive.set('boxes', boxes)
      ractive.set('pinLength', new_length)
      return;
    }
    if(new_length < old_length) {
      boxes[old_length - 1].dot = false
      ractive.set('boxes', boxes)
      ractive.set('pinLength', new_length)
      return;
    }
  })

  ractive.on('enter-pin', function(event){
    if(!validatePin(getPin())){
      emitter.emit('clear-pin')
      return showError({ message: 'Pin must be a 4-digit number' })
    }

    ractive.set('opening', true)
    if(ractive.get('userExists')) {
      ractive.set('progress', 'Verifying pin')
    } else {
      ractive.set('progress', 'Setting pin')
    }

    if(userExists) {
      return Hive.walletExists(function(walletExists){
        if(walletExists) { return openWithPin() }
        setPin()
      })
    }
    setPin()
  })

  emitter.on('clear-pin', function() {
    ractive.set('pin', '')
  })

  ractive.on('clear-credentials', function(event){
    Hive.reset(function(err){
      location.reload(false);
    })
  })

  ractive.on('back', function(){
    if(prevPage) prevPage(data)
    ractive.teardown()
  })

  function getPin(){
    var pin = ractive.get('pin')
    return pin ? pin.toString() : ''
  }

  function openWithPin(){
    Hive.openWalletWithPin(getPin(), ractive.getNetwork(), ractive.onSyncDone)
  }

  function setPin(){
    Hive.setPin(getPin(), ractive.onSyncDone)
  }

  return ractive
}

