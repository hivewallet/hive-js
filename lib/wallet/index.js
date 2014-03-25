'use strict';

var Bitcoin = require('bitcoinjs-lib')
var BIP39 = require('bip39')
var ThirdParty = require('hive-thrid-party-api')
var API = ThirdParty.Blockchain
var txToHiveTx = ThirdParty.txToHiveTx

var Wallet = Bitcoin.Wallet
var convert = Bitcoin.convert
var Transaction = Bitcoin.Transaction
Transaction.feePerKb = 10000

var bip39 = new BIP39()
var api = new API()
var wallet = null
var seed = null

function getSeed() { return seed }

function sendTx(tx, callback) {
  var txHex = convert.bytesToHex(tx.serialize())
  api.sendTx(txHex, function(err, hiveTx){
    if(err) { return callback(err) }

    wallet.processTx(tx)
    if(currentAddressUsed()){
      wallet.currentAddress = nextReceiveAddress()
    }

    callback(null, txToHiveTx(tx))
  })
}

function currentAddressUsed(){
  var usedAddresses = []
  for (var key in wallet.outputs){
    var output = wallet.outputs[key]
    if(output.address === wallet.currentAddress) {
      return true
    }
  }
  return false
}

function nextReceiveAddress() {
  var address = wallet.currentAddress
  var addressIndex = wallet.addresses.indexOf(address)
  if(addressIndex === wallet.addresses.length - 1){
    address = wallet.generateAddress()
  } else {
    address = wallet.addresses[addressIndex + 1]
  }
  return address
}

function openWallet (passphrase, network, syncDone, transactionsLoaded) {
  seed = bip39.mnemonicToSeed(passphrase)
  wallet = new Wallet(convert.hexToBytes(seed), network)

  wallet.balance = 0
  wallet.transactions = []
  wallet.getSeed = getSeed
  wallet.sendTx = sendTx

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
    for(var i=0; i<addresses.length; i++){
      var address = addresses[i]
      if(address.txCount === 0){
        unusedAddress = address
        break
      }
    }

    if(unusedAddress) {
      wallet.currentAddress = unusedAddress.address
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
    var changeAddresses = [wallet.generateChangeAddress()] // one and only change address
    var addresses = wallet.addresses.concat(changeAddresses)

    api.getUnspent(addresses, function(err, unspent){
      if(err) return done(err)

      //TODO: bitcoinjs-lib to provide async interface
      try{
        wallet.setUnspentOutputs(unspent)
      } catch(err){
        return done(err)
      }

      done(null)
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
