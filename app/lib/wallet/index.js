'use strict';

var Bitcoin = require('bitcoinjs-lib')
var worker = new Worker('./worker.js')
var auth = require('./auth')
var db = require('./db')
var emitter = require('hive-emitter')
var crypto = require('crypto')
var ThirdParty = require('hive-thrid-party-api')
var API = ThirdParty.Blockchain
var txToHiveTx = ThirdParty.txToHiveTx

var convert = Bitcoin.convert
var Transaction = Bitcoin.Transaction
var Wallet = Bitcoin.Wallet
Transaction.feePerKb = 10000

var api = new API()
var wallet = null
var seed = null
var mnemonic = null

function getSeed() { return seed }
function getMnemonic() { return mnemonic }

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

function createWallet(callback, network) {
  emitter.emit('wallet-opening', 'Generating seed phrase')
  worker.postMessage()
  worker.addEventListener('message', function(e) {
    initWallet(e.data, network)

    callback()
  }, false)
}

function setPin(pin, callback) {
  wallet.pin = pin

  auth.register(wallet.id, wallet.pin, function(err, token){
    db.saveSeed(wallet.id, wallet.getSeed(), token, callback)
  })
}

function openWallet (passphrase, network, syncDone, transactionsLoaded) {
  emitter.emit('wallet-opening', 'Decoding seed phrase')
  worker.postMessage({passphrase: passphrase})

  worker.addEventListener('message', function(e) {
    initWallet(e.data, network)

    var defaultCallback = function(err){ if(err) console.error(err) }
    syncDone = syncDone || defaultCallback
    transactionsLoaded = transactionsLoaded || defaultCallback
    sync(syncDone, transactionsLoaded)
  }, false)
}

function initWallet(data, network) {
  seed = data.seed
  mnemonic = data.mnemonic
  wallet = new Wallet(convert.hexToBytes(seed), network)

  wallet.balance = 0
  wallet.transactions = []
  wallet.getSeed = getSeed
  wallet.getMnemonic = getMnemonic
  wallet.sendTx = sendTx
  wallet.id = crypto.createHash('sha256').update(seed).digest('base64')
}

function sync(done, transactionsLoaded){
  emitter.emit('wallet-opening', 'Synchronizing wallet balance and transaction history')
  wallet.synchronizing = true
  var addresses = generateAddresses(5)
  api.listAddresses(addresses, onAddresses, onTransactions)

  function onAddresses(err, addresses) {
    if(err) return done(err)

    var unusedAddress = undefined;
    for(var i=0; i<addresses.length; i++){
      var address = addresses[i]
      if(address.txCount === 0){
        unusedAddress = address.address
        break
      }
    }

    if(unusedAddress) {
      wallet.currentAddress = unusedAddress
      wallet.synchronizing = false

      wallet.generateChangeAddress() // one and only change address
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
    if(wallet.addresses[0] === wallet.currentAddress) { // new wallet
      return done();
    }

    var addresses = wallet.addresses.concat(wallet.changeAddresses)
    api.getUnspent(addresses, function(err, unspent){
      if(err) return done(err)

      wallet.setUnspentOutputsAsync(unspent, done)
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
  createWallet: createWallet,
  setPin: setPin,
  getWallet: getWallet
}
