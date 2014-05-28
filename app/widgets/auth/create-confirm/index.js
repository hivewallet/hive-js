'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var pinPage = require('../pin')

module.exports = function(){
  var passphrase = Hive.getWallet().getMnemonic()
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template
    },
    data: {
      passphrase: passphrase
    }
  })

  ractive.on('create-pin', function(event) {
    pinPage()
  })

  return ractive
}
