'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
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
      userExists: userExists
    }
  })

  ractive.on('enter-pin', function(event){
    if(!validatePin(getPin(), userExists)){
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

