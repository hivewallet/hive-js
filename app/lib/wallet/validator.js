var Address = require('bitcoinjs-lib').Address
var assert = require('assert')
var btcToSatoshi = require('hive-convert').btcToSatoshi
var satoshiToBtc = require('hive-convert').satoshiToBtc

function validateSend(wallet, to, btcValue, callback){
  var amount = btcToSatoshi(btcValue)
  var network = wallet.getMasterKey().network

  try{
    var addressObj = Address.fromBase58Check(to)
    assert(addressObj.version === network.pubKeyHash)
  } catch(e) {
    return callback(new Error('Please enter a valid address to send to'))
  }

  try {
    tx = wallet.createTx(to, amount)
  } catch(e) {
    var message = e.message

    if(message.match(/dust threshold/)) {
      message = 'Please enter an amount above ' + satoshiToBtc(network.dustThreshold)
    }

    return new callback(new Error(message))
  }

  callback()
}

module.exports = validateSend
