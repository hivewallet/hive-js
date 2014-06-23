'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var pinPage = require('../pin')

function confirm(data){
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
    },
    data: {
      passphrase: data.mnemonic
    }
  })

  ractive.on('create-pin', function(event) {
    pinPage(confirm, data)
    ractive.teardown()
  })

  return ractive
}

module.exports = confirm
