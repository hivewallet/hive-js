'use strict';

var Bitcoin = require('bitcoinjs-lib')
var BIP39 = require('bip39')
var xhr = require('xhr')

var Wallet = Bitcoin.Wallet
var convert = Bitcoin.convert
var bip39 = new BIP39()

var wallet = new Wallet()
var seed = null

wallet.getSeed = function() { return seed }

wallet.openWallet = function(passphrase, network) {
  seed = bip39.mnemonicToSeed(passphrase)
  wallet.newMasterKey(convert.hexToBytes(seed), network)

  sync(function(err){
    if(err) console.error(err) //TODO: pass it back up
  })
}

function sync(callback){
  wallet.synchronizing = true
  var addresses = generateAddresses(5)
  listAddresses(addresses, function(err, addresses) {
    if(err) return callback(err)

    var unusedAddress = addresses.filter(function(a){
      return address.txCount === 0
    })[0]

    if(unusedAddress) {
      wallet.nextReceiveAddress = unusedAddress
      wallet.synchronizing = false
      return callback(null)
    } else {
      sync(callback)
    }
  })
}

function generateAddresses(n) {
  var addresses = []
  for(var i = 0; i < n; i++){
    addresses.push(wallet.generateAddress())
  }
  return addresses
}

// Hive objects
function Address(address){
  this.address = address
}

Address.prototype.toString(){
  return this.address
}

Address.fromBlockchainAddress = function(address) {
  var result = new Address(address['address'])
  result.txCount = address['n_tx']
  result.totalSent = address['total_sent']
  result.totalReceived = address['total_received']
  result.balance = address['final_balance']
  return result
}

// blockchain api
function listAddresses(addresses, callback){
  xhr({
    uri: "https://blockchain.info/multiaddr?cors=true&active=" + addresses.join('|'),
    headers: {
        "Content-Type": "application/json"
    }
  }, function (err, resp, body) {
    if(err) return callback(err)

    if(resp.statusCode !== 200) {
      console.err(resp.body)
      var error = new Error("Expect response status code to be 200, but got " + resp.statusCode)
      return callback(error)
    }

    var body = JSON.parse(resp.body)
    callback(null, parseAddresses(body.addresses))
  })

  function parseAddresses(addresses){
    return addresses.map(Address.fromBlockchainAddress)
  }
}

module.exports = wallet
