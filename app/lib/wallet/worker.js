'use strict';

var BIP39 = require('bip39')

module.exports = function (self) {
  self.addEventListener('message', function(e) {
    var data = e.data || {}
    var mnemonic = data.passphrase || BIP39.entropyToMnemonic(data.entropy)

    var valid = BIP39.validateMnemonic(mnemonic)
    if(!valid) {
      throw new Error('Invalid passphrase')
    }
    var seed = BIP39.mnemonicToSeedHex(mnemonic)

    self.postMessage({seed: seed, mnemonic: mnemonic})
  }, false);
}

