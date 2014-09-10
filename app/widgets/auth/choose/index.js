'use strict';

var Ractive = require('../auth')
var passphrasePage = require('../passphrase')
var createIntroPage = require('../create-intro')

module.exports = function choose(){
  var ractive = new Ractive({
    partials: {
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
    }
  })

  ractive.on('create-new-wallet', function(){
    createIntroPage(choose)
    ractive.teardown()
  })

  ractive.on('reveal-passphrase-input', function(){
    passphrasePage(choose)
    ractive.teardown()
  })

  return ractive
}

