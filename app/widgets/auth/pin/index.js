'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var validatePin = require('hive-pin-validator')

module.exports = function(userExists){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template
    },
    data: {
      userExists: userExists
    }
  })

  ractive.on('enter-pin', function(event){
    if(!validatePin(getPin())){
      return alert('Pin must be a 4-digit number')
    }

    ractive.set('opening', true)
    ractive.set('progress', 'Verifying pin')
    ractive.loading()

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

  function getPin(){
    return ractive.get('pin').toString()
  }

  function openWithPin(){
    Hive.openWalletWithPin(getPin(), ractive.getNetwork(), ractive.onSyncDone)
  }

  function setPin(){
    Hive.setPin(getPin(), ractive.onSyncDone)
  }

  return ractive
}

