'use strict';

var Ractive = require('ractify')
var mnemonic = require('mnemonic')
var wallet = require('hive-wallet')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  });

  ractive.on('open-wallet', function(event){
    var seed = mnemonic.decode(ractive.get('passphrase').split(' '))
    wallet.newMasterKey(seed, getNetwork())
    event.original.preventDefault()

    location.hash = '#profile'
  })

  function getNetwork() {
    if(location.search.indexOf('testnet=true') > 0) {
      return 'testnet'
    }
  }

  return ractive
}
