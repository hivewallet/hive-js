'use strict';

var Hive = require('hive-wallet')
var Ractive = require('../auth')
var pinPage = require('../pin')
var showError = require('hive-modal-flash').showError

function enterPassphrase(prevPage){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
    }
  })

  ractive.on('back', function(){
    prevPage()
    ractive.teardown()
  })

  ractive.on('open-wallet-with-passphrase', function() {
    var passphrase = getPassphrase()

    if (passphrase !== '') {
      Hive.createWallet(passphrase, ractive.getNetwork(), onWalletCreated)
      ractive.set('opening', true)
      ractive.set('progress', 'Checking passphrase...')
    }
  })

  function getPassphrase() {
    return (ractive.get('passphrase').toLowerCase() || '').trim()
  }

  function onWalletCreated(err, data) {
    ractive.set('opening', false)

    if(err) {
      return showError({ message: err })
    }

    pinPage(enterPassphrase, data)
    ractive.teardown()
  }

  return ractive
}

module.exports = enterPassphrase
