'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')

module.exports = function(walletExist){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template
    },
    data: {
      walletExist: walletExist
    }
  })

  ractive.on('enter-pin', function(event){
    Hive.setPin(getPin(), ractive.onSyncDone)
    ractive.set('opening', true)
  })

  function getPin(){
    return ractive.get('pin')
  }

  ractive.nodes.setPin.focus()
  return ractive
}

