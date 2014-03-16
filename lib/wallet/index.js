'use strict';

var Bitcoin = require('bitcoinjs-lib')
var BIP39 = require('bip39')
var API = require('hive-thrid-party-api').Blockchain

var Wallet = Bitcoin.Wallet
var convert = Bitcoin.convert
var bip39 = new BIP39()

var api = new API()
var wallet = new Wallet()
var seed = null

wallet.getSeed = function() { return seed }

wallet.openWallet = function(passphrase, network, syncDone, transactionsLoaded) {
  seed = bip39.mnemonicToSeed(passphrase)
  wallet.newMasterKey(convert.hexToBytes(seed), network)

  wallet.balance = 0
  wallet.transactions = []

  var defaultCallback = function(err){ if(err) console.error(err) }
  syncDone = syncDone || defaultCallback
  transactionsLoaded = transactionsLoaded || defaultCallback
  sync(syncDone, transactionsLoaded)
}

function sync(done, transactionsLoaded){
  wallet.synchronizing = true
  var addresses = generateAddresses(5)
  api.listAddresses(addresses, onAddresses, onTransactions)

  function onAddresses(err, addresses) {
    if(err) return done(err)

    var unusedAddress = undefined;
    var balance = 0;
    for(var i=0; i<addresses.length; i++){
      var address = addresses[i]
      if(address.txCount === 0){
        unusedAddress = address
        break
      } else {
        balance += address.balance
      }
    }

    wallet.balance += balance
    if(unusedAddress) {
      wallet.nextReceiveAddress = unusedAddress
      wallet.synchronizing = false
      return done(null)
    } else {
      sync(done, transactionsLoaded)
    }
  }

  function onTransactions(err, transactions){
    if(err) return transactionsLoaded(err)

    // prepend transactions
    Array.prototype.unshift.apply(wallet.transactions, transactions)
    return transactionsLoaded(null, transactions)
  }
}


function generateAddresses(n) {
  var addresses = []
  for(var i = 0; i < n; i++){
    addresses.push(wallet.generateAddress())
  }
  return addresses
}

module.exports = wallet
