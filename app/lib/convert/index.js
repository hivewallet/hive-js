'use strict'

var Big = require('big.js')

function btcToSatoshi(btc) {
  if(btc == undefined || btc === '') return;
  return parseInt(new Big(btc).times(100000000), 10)
}

function satoshiToBtc(satoshi) {
  if(satoshi == undefined || satoshi === '') return;
  return parseFloat(new Big(satoshi).div(100000000))
}

module.exports = {
  btcToSatoshi: btcToSatoshi,
  satoshiToBtc: satoshiToBtc
}
