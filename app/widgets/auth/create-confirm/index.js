'use strict';

var Ractive = require('../auth')
var pinPage = require('../pin')
var animateCheckbox = require('hive-transitions/highlight.js')
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

  ractive.on('toggle-check', function(){
    if(ractive.get('checked')) {
      ractive.set('checked', false)
    } else {
      ractive.set('checked', true)
    }
  })

  ractive.on('create-pin', function() {
    if(!ractive.get('checked')) return animateCheckbox(ractive.nodes.check);
    pinPage(confirm, data)
    ractive.teardown()
  })

  return ractive
}

module.exports = confirm
