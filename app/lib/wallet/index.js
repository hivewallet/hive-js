'use strict';

var worker = new Worker('./worker.js')
var auth = require('./auth')
var db = require('./db')
var emitter = require('hive-emitter')
var crypto = require('crypto')
var AES = require('hive-aes')
var denominations = require('hive-denomination')
var Wallet = require('cb-wallet')
var validateSend = require('./validator')
var rng = require('secure-random').randomBuffer

var Bitcoin = require('bitcoinjs-lib')
var Transaction = Bitcoin.Transaction
var HDNode = Bitcoin.HDNode

var wallet = null
var seed = null
var id = null

function createWallet(passphrase, network, callback) {
  var message = passphrase ? 'Decoding seed phrase' : 'Generating'
  emitter.emit('wallet-opening', message)

  var data = {passphrase: passphrase}
  if(!passphrase){
   data.entropy = rng(128 / 8).toString('hex')
  }

  worker.postMessage(data)

  worker.addEventListener('message', function(e) {
    assignSeedAndId(e.data.seed)

    var mnemonic = e.data.mnemonic
    auth.exist(id, function(err, userExists){
      if(err) return callback(err);

      callback(null, {userExists: userExists, mnemonic: mnemonic})
      mnemonic = null
    })
  }, false)

  worker.addEventListener('error', function(e) {
    return callback({message: e.message.replace("Uncaught Error: ", '')})
  })
}

function setPin(pin, network, callback) {
  auth.register(id, pin, function(err, token){
    if(err) return callback(err.error);

    emitter.emit('wallet-auth', {token: token, pin: pin})

    var encrypted = AES.encrypt(seed, token)
    db.saveEncrypedSeed(id, encrypted, function(err){
      if(err) return callback(err);

      var accounts = getAccountsFromSeed(network)
      initWallet(accounts.externalAccount, accounts.internalAccount, network, callback)
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

      emitter.emit('wallet-auth', {token: token, pin: pin})

      assignSeedAndId(AES.decrypt(encryptedSeed, token))

      var accounts = getAccountsFromSeed(network)
      initWallet(accounts.externalAccount, accounts.internalAccount, network, syncDone)
    })
  })
}

function assignSeedAndId(s) {
  seed = s
  id = crypto.createHash('sha256').update(seed).digest('hex')
  emitter.emit('wallet-init', {seed: seed, id: id})
}

function getAccountsFromSeed(networkName, done) {
  emitter.emit('wallet-opening', 'Synchronizing Wallet')

  var network = Bitcoin.networks[networkName]
  var accountZero = HDNode.fromSeedHex(seed, network).deriveHardened(0)

  return {
    externalAccount: accountZero.derive(0),
    internalAccount: accountZero.derive(1)
  }
}

function initWallet(externalAccount, internalAccount, networkName, done){
  var network = Bitcoin.networks[networkName]
  new Wallet(externalAccount, internalAccount, networkName, function(err, w) {
    if(err) return done(err)

    wallet = w
    wallet.denomination = denominations[networkName].default

    var txObjs = wallet.getTransactionHistory()
    done(null, txObjs.map(function(tx) {
      return parseTx(wallet, tx)
    }))
  })
}

function parseTx(wallet, tx) {
  var id = tx.getId()
  var metadata = wallet.txMetadata[id]
  var direction, toAddress
  if(metadata.value > 0) {
    direction =  'incoming'
  } else {
    var network = Bitcoin.networks[wallet.networkName]
    toAddress = Bitcoin.Address.fromOutputScript(tx.outs[0].script, network).toString()
    direction = 'outgoing'
  }

  var timestamp = metadata.timestamp
  timestamp = timestamp ? timestamp * 1000 : new Date().getTime()

  return {
    id: id,
    amount: metadata.value,
    direction: direction,
    toAddress: toAddress,
    timestamp: timestamp,
    confirmations: metadata.confirmations,
    fee: metadata.fee
  }
}

function sync(done) {
  initWallet(wallet.externalAccount, wallet.internalAccount, wallet.networkName, done)
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
  validateSend: validateSend,
  parseTx: parseTx
}
