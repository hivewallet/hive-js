'use strict'

function btcToSatoshi(btc) {
  if(btc == undefined || btc === '') return;
  return btc * 100000000
}

function satoshiToBtc(satoshi) {
  if(satoshi == undefined || satoshi === '') return;
  return satoshi / 100000000
}

function toDecimal(val, precision) {
  if(val == undefined || val === '') return;
  return Math.floor(precision * val) / precision
}

module.exports = {
  btcToSatoshi: btcToSatoshi,
  satoshiToBtc: satoshiToBtc,
  toDecimal: toDecimal
}
