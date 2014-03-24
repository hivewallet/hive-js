'use strict';

var Bitcoin = require('bitcoinjs-lib')
var BIP39 = require('bip39')
var API = require('hive-thrid-party-api').Blockchain

var Wallet = Bitcoin.Wallet
var convert = Bitcoin.convert
var Transaction = Bitcoin.Transaction
Transaction.feePerKb = 10000

var bip39 = new BIP39()
var api = new API()
var wallet = null
var seed = null

function openWallet (passphrase, network, syncDone, transactionsLoaded) {
  seed = bip39.mnemonicToSeed(passphrase)
  wallet = new Wallet(convert.hexToBytes(seed), network)

  wallet.balance = 0
  wallet.transactions = []
  wallet.getSeed = function() { return seed }

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
      setUnspentOutputs()
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

  function setUnspentOutputs(){
    var error = null
    api.getUnspent(wallet.addresses, function(err, unspent){
      if(err) return done(err)

      //TODO: bitcoinjs-lib to provide async interface
      try{
        wallet.setUnspentOutputs(unspent)
      } catch(err){
        error = err
      } finally {
        return done(error)
      }
    })
  }
}

function generateAddresses(n) {
  var addresses = []
  for(var i = 0; i < n; i++){
    addresses.push(wallet.generateAddress())
  }
  return addresses
}

function getWallet(){
  return wallet
}

module.exports = {
  openWallet: openWallet,
  getWallet: getWallet
}
