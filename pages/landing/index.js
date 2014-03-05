'use strict';

var Ractive = require('ractify')
var mnemonic = require('mnemonic')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  });

  ractive.on('open-wallet', function(event){
    var seed = mnemonic.decode(ractive.get('passphrase').split(' '))
    console.log(seed)
    event.original.preventDefault()
  })

  return ractive
}
