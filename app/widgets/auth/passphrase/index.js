'use strict';

var Hive = require('hive-wallet')
var Ractive = require('../auth')
var pinPage = require('../pin')
var showError = require('hive-flash-modal').showError

function enterPassphrase(prevPage){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
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

  function onWalletCreated(err, data) {
    ractive.pauseLoading()
    ractive.set('opening', false)

    if(err) {
      return showError({ message: err })
    }

    pinPage(enterPassphrase, data)
  }

  return ractive
}

module.exports = enterPassphrase
