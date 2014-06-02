var Blockchain = require('./blockchain')
var Blockr = require('./blockr')
var Transaction = require('./transaction')
var convert = require('bitcoinjs-lib').convert

function txToHiveTx(tx) {
  var result = new Transaction(convert.bytesToHex(tx.getHash()))
  var out = tx.outs[0]
  result.timestamp = (new Date()).getTime()
  result.amount = -out.value
  result.direction = 'outgoing'
  result.toAddress = out.address.toString()
  result.pending = true

  return result
}


module.exports = {
  Blockchain: Blockchain,
  Blockr: Blockr,
  txToHiveTx: txToHiveTx
}
