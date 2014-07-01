var Address = require('bitcoinjs-lib').Address
var assert = require('assert')

function validateSend(wallet, to, value, callback){
  try{
    var addressObj = Address.fromBase58Check(to)
    var network = wallet.getMasterKey().network
    assert(addressObj.version === network.pubKeyHash)
  } catch(e) {
    return callback(new Error('Please enter a valid address to send to.'))
  }

  callback()
}

module.exports = validateSend
