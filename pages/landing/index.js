'use strict';

var Ractive = require('ractify')
var mnemonic = require('mnemonic')
var wallet = require('hive-wallet')
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  });

  ractive.on('open-wallet', function(event){
    event.original.preventDefault()

    wallet.newMasterKey(getSeed(), getNetwork())
    emitter.emit('wallet-ready')

    location.hash = '#profile'
  })

  function getSeed(){
    return mnemonic.decode(ractive.get('passphrase').split(' '))
  }

  function getNetwork() {
    if(location.search.indexOf('testnet=true') > 0) {
      return 'testnet'
    }
  }

  return ractive
}
