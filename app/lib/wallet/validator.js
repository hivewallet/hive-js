var Address = require('bitcoinjs-lib').Address
var assert = require('assert')
var btcToSatoshi = require('hive-convert').btcToSatoshi
var satoshiToBtc = require('hive-convert').satoshiToBtc

function validateSend(wallet, to, btcValue, callback){
  var amount = btcToSatoshi(btcValue)
  var network = wallet.getMasterKey().network
  var tx = null

  try{
    var addressObj = Address.fromBase58Check(to)
    assert(addressObj.version === network.pubKeyHash || addressObj.version === network.scriptHash)
  } catch(e) {
    return callback(new Error('Please enter a valid address to send to'))
  }

  try {
    tx = wallet.createTx(to, amount)
  } catch(e) {
    var message = e.message

    if(message.match(/dust threshold/)) {
      message = 'Please enter an amount above'
      error = new Error(message)
      error.interpolations = { dust: satoshiToBtc(network.dustThreshold) }
      return new callback(error)
    } else if(message.match(/Not enough funds/)) {
      var hasAndNeeded = getHasAndNeeded(message)
      var has = hasAndNeeded[0]
      var needed = hasAndNeeded[1]
      var spendAll = attemptToEmptyWallet()
      var error

      if(sufficientWithPending(needed) || (spendAll && hasPendingUtxo())){
        error = new Error("Some funds are temporarily unavailable. To send this transaction, you will need to wait for your pending transactions to be confirmed first (this should not take more than a few minutes).")
        error.href = "https://github.com/hivewallet/hive-osx/wiki/Sending-Bitcoin-from-a-pending-transaction"
        error.linkText = "What does this mean?"
        return callback(error)
      } else if(spendAll){
        var sendableBalance = satoshiToBtc(amount - (needed - has))

        message = [
          "It seems like you are trying to empty your wallet",
          "Taking transaction fee into account, we estimated that the max amount you can send is",
          "We have amended the value in the amount field for you"
        ].join('. ')

        error = new Error(message)
        error.interpolations = { sendableBalance: sendableBalance }

        return new callback(error)
      } else {
        message = "You do not have enough funds in your wallet"
      }
    }

    return new callback(new Error(message))
  }

  var fee = network.estimateFee(tx)
  callback(null, satoshiToBtc(fee))

  function sufficientWithPending(needed){
    return needed <= wallet.getBalance()
  }

  function attemptToEmptyWallet(){
    var balance = wallet.getBalance()
    return balance - network.feePerKb < amount && amount <= balance
  }

  function getHasAndNeeded(message) {
    return message.replace(/[^\d]+(\d+)[^\d]+(\d+)/, "$1 $2").split(' ').map(function(m){
      return parseInt(m)
    })
  }

  function hasPendingUtxo(){
    return wallet.getUnspentOutputs().some(function(utxo){
      return utxo.pending
    })
  }
}

module.exports = validateSend
