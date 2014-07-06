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
      boxes: [false, false, false, false]
    }
  })

  ractive.on('focus-pin', function(){
    ractive.set('pinfocused', true)
  })

  ractive.on('blur-pin', function(){
    ractive.set('pinfocused', false)
  })

  ractive.observe('pin', function(){
    var dots = ractive.nodes['setPin'].value.length
    var boxes = ractive.get('boxes')

    boxes.forEach(function(_, i){
      boxes[i] = i < dots
    })

    ractive.set('boxes', boxes)
  })

  ractive.on('enter-pin', function(){
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

  ractive.on('clear-credentials', function(){
    Hive.reset(function(){
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

