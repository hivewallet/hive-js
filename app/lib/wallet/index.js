'use strict';

var Bitcoin = require('bitcoinjs-lib')
var worker = new Worker('./worker.js')
var auth = require('./auth')
var db = require('./db')
var emitter = require('hive-emitter')
var crypto = require('crypto')
var AES = require('hive-aes')
var ThirdParty = require('hive-thrid-party-api')
var API = ThirdParty.Blockr
var txToHiveTx = ThirdParty.txToHiveTx
var uniqueify = require('uniqueify')

var convert = Bitcoin.convert
var Transaction = Bitcoin.Transaction
var Wallet = Bitcoin.Wallet
Transaction.feePerKb = 10000

var api = new API()
var wallet = null
var seed = null

function sendTx(tx, callback) {
  var txHex = convert.bytesToHex(tx.serialize())
  api.sendTx(txHex, function(err, hiveTx){
    if(err) { return callback(err) }

    processTx(tx)
    db.addPendingTx(txHex, function(err){
      if(err) { console.log("failed to save pending transaction to local db") }
      callback(null, txToHiveTx(tx))
    })
  })
}

function processTx(tx) {
  wallet.processTx(tx)
  if(currentAddressUsed()){ // in case one sends to him/her self
    wallet.currentAddress = nextReceiveAddress()
  }
}

function processLocalPendingTxs(callback) {
  db.getPendingTxs(function(err, txs){
    if(err) return callback(err);

    var pendingTxs = []
    var hiveTxs = []
    txs.forEach(function(txHex){
      var tx = Transaction.deserialize(txHex)
      hiveTxs.push(txToHiveTx(tx))

      tx.ins.forEach(function(txIn, i){
        var op = txIn.outpoint
        var o = wallet.outputs[op.hash+':'+op.index]

        if(o) { // not yet spent for real
          pendingTxs.push(tx)
        }
      })
    })

    pendingTxs = uniqueify(pendingTxs)
    pendingTxs.forEach(processTx)

    // one or more pending txs are confirmed
    if(pendingTxs.length !== txs.length) {
      db.setPendingTxs(pendingTxs, function(err){
        if(err) return callback(err);
        callback(null, hiveTxs)
      })
    }

    callback(null, hiveTxs)
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

function createWallet(passphrase, network, callback) {
  var message = passphrase ? 'Decoding seed phrase' : 'Generating seed phrase'
  emitter.emit('wallet-opening', message)
  worker.postMessage({passphrase: passphrase})
  worker.addEventListener('message', function(e) {
    var err = e.data.error
    if(err) {
      return callback(err)
    }

    var mnemonic = initWallet(e.data, network)
    auth.exist(wallet.id, function(err){
      if(err) return callback(err);

      callback(null, mnemonic)
      mnemonic = null
    })
  }, false)
}

function setPin(pin, callback) {
  //TODO: captcha
  auth.register(wallet.id, pin, function(err, token){
    if(err) return callback(err.error);

    wallet.token = token
    wallet.pin = pin
    var encrypted = AES.encrypt(seed, token)
    db.saveEncrypedSeed(wallet.id, encrypted, function(err, res){
      if(err) return callback(err);

      firstTimeSync(callback)
    })
  })
}

function disablePin(pin, callback) {
  auth.disablePin(wallet.id, pin, function(err){
    if(err) return callback(err);

    wallet.pin = ''
    callback()
  })
}

function openWalletWithPin(pin, network, syncDone) {
  db.getCredentials(function(err, credentials){
    if(err) return syncDone(err);

    var id = credentials.id
    var encryptedSeed = credentials.seed
    auth.login(id, pin, function(err, token){
      if(err){
        if(err.error === 'user_deleted') {
          return db.deleteCredentials(credentials, function(deleteError){
            syncDone(err.error);
          })
        }
        return syncDone(err.error)
      }

      initWallet({seed: AES.decrypt(encryptedSeed, token)}, network)
      wallet.token = token
      wallet.pin = pin
      firstTimeSync(syncDone)
    })
  })
}

function initWallet(data, network) {
  seed = data.seed
  wallet = new Wallet(convert.hexToBytes(seed), network)

  wallet.sendTx = sendTx
  wallet.id = crypto.createHash('sha256').update(seed).digest('hex')

  emitter.emit('wallet-init', seed)
  return data.mnemonic
}

function sync(done) {
  var pending = 3
  var transactions = []

  api.getTransactions(wallet.addresses, function(err, transactions){
    if(err) return done(err);
    maybeDone(transactions)
  })

  setUnspentOutputs(function(err){
    if(err) return done(err);
    processLocalPendingTxs(function(err, transactions){
      if(err) return done(err);
      maybeDone(transactions)
    })
  })

  fetchChangeAddressSentTransactions(function(err, transactions){
    if(err) return done(err)
    maybeDone(transactions)
  })

  function maybeDone(txs){
    if(txs) transactions = transactions.concat(txs)

    if(--pending === 0) {
      done(null, consolidateTransactions(transactions))
    }
  }
}

function fetchChangeAddressSentTransactions(callback){
  api.getTransactions(wallet.changeAddresses, function(err, txs){
    if(err) return callback(err)
      callback(null, txs.filter(function(tx){
        return tx.amount < 0 // include only sent transactions
      }))
  })
}

function consolidateTransactions(transactions){
  return uniqueify(transactions).sort(function(tx1, tx2){
    return tx1.timestamp > tx2.timestamp ? -1 : 1
  })
}

function defaultCallback(err){ if(err) console.error(err) }

function setUnspentOutputs(done){
  if(wallet.addresses[0] === wallet.currentAddress) { // new wallet
    return done();
  }

  var addresses = wallet.addresses.concat(wallet.changeAddresses)
  api.getUnspent(addresses, function(err, unspent){
    if(err) return done(err)

    wallet.setUnspentOutputsAsync(unspent, done)
  })
}

function firstTimeSync(done){
  emitter.emit('wallet-opening', 'Synchronizing wallet balance and transaction history')

  done = done || defaultCallback

  var addresses = generateAddresses(5)
  api.listAddresses(addresses, onAddresses)

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
      wallet.generateChangeAddress() // one and only change address
      sync(done)
    } else {
      firstTimeSync(done)
    }
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

function walletExists(callback) {
  db.getCredentials(function(err, doc){
    if(doc) return callback(true);
    return callback(false)
  })
}

function reset(callback){
  db.getCredentials(function(err, credentials){
    if(err) return callback(err);

    db.deleteCredentials(credentials, function(deleteError){
      callback(deleteError)
    })
  })
}

module.exports = {
  openWalletWithPin: openWalletWithPin,
  createWallet: createWallet,
  setPin: setPin,
  disablePin: disablePin,
  getWallet: getWallet,
  walletExists: walletExists,
  reset: reset,
  sync: sync
}
