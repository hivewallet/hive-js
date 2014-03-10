'use strict';

var Ractive = require('ractify')
var bip39 = require('bip39')
var wallet = require('hive-wallet')
var emitter = require('hive-emitter')
var convert = require('bitcoinjs-lib').convert

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
    var seedHex = bip39.mnemonicToSeed(ractive.get('passphrase').trim())
    return convert.bytesToString(convert.hexToBytes(seedHex))
  }

  function getNetwork() {
    if(location.search.indexOf('testnet=true') > 0) {
      return 'testnet'
    }
  }

  return ractive
}
