'use strict';

var Hive = require('hive-wallet')
var emitter = require('hive-emitter')
var Ractive = require('../auth')
var pinPage = require('../pin')

module.exports = function(prevPage){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template
    }
  })

  ractive.on('back', function(event){
    prevPage()
  })

  ractive.on('open-wallet-with-passphrase', function(event){
    Hive.createWallet(getPassphrase(), ractive.getNetwork(), onWalletCreated)
    ractive.set('opening', true)
    ractive.set('progress', 'Checking passphrase...')
  })

  function getPassphrase(){
    return ractive.get('passphrase').trim()
  }

  function onWalletCreated(err, walletExist) {
    ractive.pauseLoading()
    ractive.set('opening', false)

    if(err) {
      return emitter.emit('open-error', { message: err })
    }

    pinPage(walletExist)
  }

  return ractive
}

