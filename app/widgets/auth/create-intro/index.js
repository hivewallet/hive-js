'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')

module.exports = function(){
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template
    }
  })

  ractive.on('generate-phrase', function(){
    ractive.set('progress', 'Generating passphrase...')
    ractive.loading()
    Hive.createWallet(null, getNetwork(), onSeedCreated)
  })

  return ractive
}

