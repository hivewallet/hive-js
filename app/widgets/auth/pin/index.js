'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var validatePin = require('hive-pin-validator')
var showError = require('hive-modal-flash').showError

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
      pin: '',
      boxes: [null, null, null, null],
      visible: function(number){
        return number != null
      }
    }
  })

  ractive.on('focus-pin', function(){
    ractive.set('pinfocused', true)
  })

  ractive.on('blur-pin', function(){
    ractive.set('pinfocused', false)
  })

  ractive.observe('pin', function(){
    var pin = ractive.nodes['setPin'].value

    var boxes = pin.split('')
    if(boxes.length === 4) {
      ractive.nodes.setPin.blur()
      ractive.fire('enter-pin')
    } else {
      for(var i=boxes.length; i<4; i++) {
        boxes[i] = null
      }
      ractive.set('boxes', boxes)
    }
  })

  ractive.on('enter-pin', function(){
    if(!validatePin(getPin())){
      emitter.emit('clear-pin')
      return showError({ message: 'PIN must be a 4-digit number' })
    }

    ractive.set('opening', true)

    if(userExists) {
      ractive.set('progress', 'Verifying PIN')
      return Hive.walletExists(function(walletExists){
        if(walletExists) { return openWithPin() }
        setPin()
      })
    }
    ractive.set('progress', 'Setting PIN')
    ractive.set('userExists', true)
    setPin()
  })

  emitter.on('clear-pin', function() {
    ractive.nodes['setPin'].value = ''
    ractive.set('pin', '')
    ractive.set('boxes', [null, null, null, null])
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

