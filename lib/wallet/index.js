'use strict';

var Bitcoin = require('bitcoinjs-lib')
var BIP39 = require('bip39')

var Wallet = Bitcoin.Wallet
var convert = Bitcoin.convert
var bip39 = new BIP39()

var wallet = new Wallet()
var seed = null

wallet.getSeed = function() { return seed }

wallet.openWallet = function(passphrase, network) {
  seed = bip39.mnemonicToSeed(passphrase)
  return wallet.newMasterKey(convert.hexToBytes(seed), network)
}

module.exports = wallet
