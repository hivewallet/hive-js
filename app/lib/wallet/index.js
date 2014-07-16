'use strict';

var Bitcoin = require('bitcoinjs-lib')
var worker = new Worker('./worker.js')
var auth = require('./auth')
var db = require('./db')
var emitter = require('hive-emitter')
var crypto = require('crypto')
var AES = require('hive-aes')
var denominations = require('hive-denomination')
var ThirdParty = require('hive-thrid-party-api')
var API = ThirdParty.Blockr
var uniqueify = require('uniqueify')
var async = require('async')
var validateSend = require('./validator')
var rng = require('secure-random').randomBuffer

var Transaction = Bitcoin.Transaction
var Wallet = Bitcoin.Wallet

var api = null
var wallet = null
var seed = null
var id = null

function sendTx(tx, callback) {
  var txHex = tx.toHex()
  api.sendTx(txHex, function(err){
    if(err) { return callback(err) }

    processPendingTx(tx)

    db.addPendingTx(txHex, function(err){
      if(err) { console.log("failed to save pending transaction to local db") }
      callback(null, api.txToHiveTx(tx))
    })
  })
}

function processPendingTx(tx) {
  wallet.processPendingTx(tx)

  if(addressUsed(wallet.currentAddress)){ // in case one sends to him/her self
    wallet.currentAddress = nextReceiveAddress()
  }
  if(addressUsed(wallet.changeAddresses[wallet.changeAddresses.length  - 1])){
    wallet.generateChangeAddress()
  }
}

function processLocalPendingTxs(callback) {
  // only pending spending txs are kept locally
  db.getPendingTxs(function(err, txs){
    if(err) return callback(err);
    var txObjs = txs
      .map(Transaction.fromHex)
      .filter(function(tx){
        // keep tx whose input has not been consumed
        return tx.ins.some(function(input){
          var hashClone = new Buffer(input.hash.length)
          input.hash.copy(hashClone)
          var txId = [].reverse.call(hashClone).toString('hex')
          return (txId + ":" + input.index in wallet.outputs)
        })
      })

    txObjs.forEach(processPendingTx)

    db.setPendingTxs(txObjs.map(function(tx){
      return tx.toHex()
    }), ignoreError)

    callback(null, txObjs.map(api.txToHiveTx.bind(api)))
  })

  function ignoreError(err){
    if(err) console.error("failed to remove pending txs from db", err)
  }
}

function addressUsed(address){
  for (var key in wallet.outputs){
    var output = wallet.outputs[key]
    if(output.address === address) {
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
  var message = passphrase ? 'Decoding seed phrase' : 'Generating...'
  emitter.emit('wallet-opening', message)

  var data = {passphrase: passphrase}
  if(!passphrase){
   data.entropy = rng(128 / 8).toString('hex')
  }

  worker.postMessage(data)

  worker.addEventListener('message', function(e) {
    var mnemonic = initWallet(e.data, network)
    auth.exist(id, function(err, userExists){
      if(err) return callback(err);

      callback(null, {userExists: userExists, mnemonic: mnemonic})
      mnemonic = null
    })
  }, false)

  worker.addEventListener('error', function(e) {
    return callback(e)
  })
}

function setPin(pin, callback) {
  //TODO: captcha
  auth.register(id, pin, function(err, token){
    if(err) return callback(err.error);

    emitter.emit('wallet-auth', {token: token, pin: pin})

    var encrypted = AES.encrypt(seed, token)
    db.saveEncrypedSeed(id, encrypted, function(err){
      if(err) return callback(err);

      firstTimeSync(callback)
    })
  })
}

function disablePin(pin, callback) {
  auth.disablePin(id, pin, callback)
}

function openWalletWithPin(pin, network, syncDone) {
  db.getCredentials(function(err, credentials){
    if(err) return syncDone(err);

    var id = credentials.id
    var encryptedSeed = credentials.seed
    auth.login(id, pin, function(err, token){
      if(err){
        if(err.error === 'user_deleted') {
          return db.deleteCredentials(credentials, function(){
            syncDone(err.error);
          })
        }
        return syncDone(err.error)
      }

      initWallet({seed: AES.decrypt(encryptedSeed, token)}, network)
      emitter.emit('wallet-auth', {token: token, pin: pin})

      firstTimeSync(syncDone)
    })
  })
}

function initWallet(data, network) {
  seed = data.seed
  id = crypto.createHash('sha256').update(seed).digest('hex')
  emitter.emit('wallet-init', {seed: seed, id: id})

  wallet = new Wallet(new Buffer(seed, 'hex'), Bitcoin.networks[network])
  api = new API(network)

  wallet.sendTx = sendTx
  wallet.denomination = denominations[network].default

  return data.mnemonic
}

function sync(done) {
  var unconfirmedTxs = []

  async.parallel([
    fetchReceiveAddressTransactions,
    fetchReceiveAddressUnconfirmedTransactions,
    fetchChangeAddressSentTransactions,
    fetchChangeAddressUnconfirmedSentTransactions
  ], function(err, results){
    if(err) return done(err);

    var txs = results.reduce(function(memo, e){ return memo.concat(e)}, [])

    setUnspentOutputs(function(err){
      if(err) return done(err);

      unconfirmedTxs.forEach(processPendingTx)

      processLocalPendingTxs(function(err, pendingTxs){
        if(err) return done(err);

        txs = txs.concat(pendingTxs)
        done(null, consolidateTransactions(txs))
      })
    })
  })

  function fetchReceiveAddressTransactions(callback){
    api.getTransactions(wallet.addresses, callback)
  }

  function fetchReceiveAddressUnconfirmedTransactions(callback){
    api.getUnconfirmedTransactions(wallet.addresses, function(err, txs){
      if(err) return callback(err);

      unconfirmedTxs = unconfirmedTxs.concat(getTxObjs(txs))
      callback(null, txs)
    })
  }

  function fetchChangeAddressSentTransactions(callback){
    api.getTransactions(wallet.changeAddresses, function(err, txs){
      if(err) return callback(err);

      callback(null, getSentTransactions(txs))
    })
  }

  function fetchChangeAddressUnconfirmedSentTransactions(callback){
    api.getUnconfirmedTransactions(wallet.changeAddresses, function(err, txs){
      if(err) return callback(err);

      var sentTxs = getSentTransactions(txs)
      unconfirmedTxs = unconfirmedTxs.concat(getTxObjs(sentTxs))
      callback(null, sentTxs)
    })
  }

  function getSentTransactions(txs){
    return txs.filter(function(tx){
      return tx.amount < 0
    })
  }

  function getTxObjs(txs) {
    return txs.map(function(tx){
      return Transaction.fromHex(tx.raw)
    })
  }

  function consolidateTransactions(transactions){
    var sorted = sortTxsByPendingAndTimestamp(transactions)
    sorted = mergePendingAndConfirmedTxs(sorted)

    // prepare pending Txs for uniqueify
    sorted.forEach(function(tx){
      if(tx.pending) tx.timestamp = null;
      delete tx.raw
    })

    return uniqueify(sorted)
  }

  function sortTxsByPendingAndTimestamp(txs){
    // pending txs before confirmed txs
    return txs.sort(function(tx1, tx2){
      if(tx1.pending && !tx2.pending){
        return -1
      } else if(!tx1.pending && tx2.pending){
        return 1
      } else {
        return tx1.timestamp > tx2.timestamp ? -1 : 1
      }
    })
  }

  // if a pending tx is also found in confirmed tx, treat it as confirmed
  // (blockr bug workaround. FIXME when blockr fixes their side)
  function mergePendingAndConfirmedTxs(txs) {
    var pendingTxs = txs.filter(function(tx){ return tx.pending })
    var pendingTxIds = pendingTxs.map(function(tx){ return tx.id })

    var mergeTxIds = txs.filter(function(tx){
      return !tx.pending && pendingTxIds.indexOf(tx.id) > -1
    }).map(function(tx){
      return tx.id
    })

    return txs.filter(function(tx){
      return !tx.pending || mergeTxIds.indexOf(tx.id) < 0
    })
  }
}

function setUnspentOutputs(done){
  var addresses = wallet.addresses.concat(wallet.changeAddresses)
  api.getUnspent(addresses, function(err, unspent){
    if(err) return done(err);

    try {
      wallet.setUnspentOutputs(unspent)
    } catch(err) {
      return done(err)
    }

    done()
  })
}

function defaultCallback(err){ if(err) console.error(err) }

function firstTimeSync(done){
  emitter.emit('wallet-opening', 'Synchronizing Wallet')

  done = done || defaultCallback

  var taskCount = 2

  findUnusedAddress(wallet.generateAddress, function(unusedAddress){
    wallet.currentAddress = unusedAddress
    maybeDone()
  })

  findUnusedAddress(wallet.generateChangeAddress, function(unusedAddress){
    wallet.changeAddresses.splice(wallet.changeAddresses.indexOf(unusedAddress) + 1)
    maybeDone()
  })

  function maybeDone(){
    if(--taskCount === 0) return sync(done)
  }
}

function findUnusedAddress(addressGenFn, done){
  var addresses = generateAddresses(5, addressGenFn)
  api.listAddresses(addresses, onAddresses)

  function onAddresses(err, addresses) {
    if(err) return done(err)

    var unusedAddress;
    for(var i=0; i<addresses.length; i++){
      var address = addresses[i]
      if(address.txCount === 0){
        unusedAddress = address.address
        break
      }
    }

    if(unusedAddress) {
      done(unusedAddress)
    } else {
      findUnusedAddress(addressGenFn, done)
    }
  }
}

function generateAddresses(n, gen) {
  var addresses = []
  for(var i = 0; i < n; i++){
    addresses.push(gen.call(wallet))
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
  sync: sync,
  validateSend: validateSend
}
