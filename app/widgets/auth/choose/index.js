'use strict';

var Ractive = require('../auth')
var passphrasePage = require('../passphrase')
var createIntroPage = require('../create-intro')

module.exports = function choose(){
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template
    }
  })

  ractive.on('create-new-wallet', function(){
    createIntroPage(choose)
  })

  ractive.on('reveal-passphrase-input', function(){
    passphrasePage(choose)
  })

  return ractive
}

