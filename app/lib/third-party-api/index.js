var Blockchain = require('./blockchain')
var Blockr = require('./blockr')
var Transaction = require('./transaction')
var Bitcoin = require('bitcoinjs-lib')

function txToHiveTx(tx) {
  var result = new Transaction(tx.getHash())
  var out = tx.outs[0]
  result.timestamp = (new Date()).getTime()
  result.amount = -out.value
  result.direction = 'outgoing'
  result.toAddress = Bitcoin.Address.fromScriptPubKey(out.script).toString()
  result.pending = true

  return result
}


module.exports = {
  Blockchain: Blockchain,
  Blockr: Blockr,
  txToHiveTx: txToHiveTx
}
