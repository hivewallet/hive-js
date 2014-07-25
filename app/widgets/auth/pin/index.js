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
      boxes: [{visible: false}, {visible: false}, {visible: false}, {visible: false}]
    }
  })

  ractive.on('focus-pin', function(){
    ractive.set('pinfocused', true)
  })

  ractive.on('blur-pin', function(){
    ractive.set('pinfocused', false)
  })

  ractive.observe('pin', function(){
    var boxes = ractive.get('boxes')
    var value = ractive.nodes['setPin'].value
    var length = value.length
    var temp_string = value + ''
    var arr = temp_string.split('')

    boxes.forEach(function(_, i){
      boxes[i].number = arr[i]
      boxes[i].visible = i < length
    })

    ractive.set('boxes', boxes)

    if(boxes[3].visible) {
      ractive.nodes.setPin.blur()
      ractive.fire('enter-pin')
    }
  })

  ractive.on('enter-pin', function(){
    if(!validatePin(getPin())){
      emitter.emit('clear-pin')
      return showError({ message: 'Pin must be a 4-digit number' })
    }

    ractive.set('opening', true)

    if(userExists) {
      ractive.set('progress', 'Verifying pin')
      return Hive.walletExists(function(walletExists){
        if(walletExists) { return openWithPin() }
        setPin()
      })
    }
    ractive.set('progress', 'Setting pin')
    ractive.set('userExists', true)
    setPin()
  })

  emitter.on('clear-pin', function() {
    ractive.set('pin', '')
    ractive.set('boxes', [{visible: false}, {visible: false}, {visible: false}, {visible: false}])
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

