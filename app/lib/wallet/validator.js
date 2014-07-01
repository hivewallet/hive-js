var Address = require('bitcoinjs-lib').Address
var assert = require('assert')
var btcToSatoshi = require('hive-convert').btcToSatoshi
var satoshiToBtc = require('hive-convert').satoshiToBtc
var toFixedFloor = require('hive-convert').toFixedFloor

function validateSend(wallet, to, btcValue, callback){
  var amount = btcToSatoshi(btcValue)
  var network = wallet.getMasterKey().network
  var tx = null

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
    } else if(message.match(/Not enough funds/)) {
      if(attemptToEmptyWallet()){
        var sendableBalance = satoshiToBtc(amount - getShortAmount(message))

        message = [
          "It seems like you are trying to empty your wallet.",
          "Taking transaction fee into account, we estimated that the max amount you can send is",
          sendableBalance + ".",
          "We have amended the value in the amount field for you."
        ].join(' ')

        var error = new Error(message)
        error.sendableBalance = sendableBalance

        return new callback(error)
      } else {
        message = "You don't have enough funds in your wallet"
      }
    }

    return new callback(new Error(message))
  }

  var fee = network.estimateFee(tx)
  callback(null, satoshiToBtc(fee))

  function attemptToEmptyWallet(){
    var balance = wallet.getBalance()
    return balance - network.feePerKb < amount && amount <= balance
  }

  function getShortAmount(message){
    var values = message.replace(/[^\d]+(\d+)[^\d]+(\d+)/, "$1 $2").split(' ').map(function(m){
      return parseInt(m)
    })
    return values[1] - values[0]
  }
}

module.exports = validateSend
