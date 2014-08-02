'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var confirmPassphrasePage = require('../create-confirm')
var showError = require('hive-modal-flash').showError

module.exports = function(prevPage){
  var ractive = new Ractive({
    partials: {
      header: require('./header.ract').template,
      actions: require('./actions.ract').template,
      footer: require('./footer.ract').template
    }
  })

  ractive.on('back', function(){
    prevPage()
    ractive.teardown()
  })

  ractive.on('generate-phrase', function(){
    ractive.set('opening', true)
    ractive.set('progress', 'Generating')
    Hive.createWallet(null, this.getNetwork(), function(err, data){
      if(err) return showError(err);
      confirmPassphrasePage(data)
      ractive.teardown()
    })
  })

  return ractive
}

