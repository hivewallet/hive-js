function btcToSatoshi(btc) {
  return btc * 100000000
}

function satoshiToBtc(satoshi) {
  return satoshi / 100000000
}

module.exports = {
  btcToSatoshi: btcToSatoshi,
  satoshiToBtc: satoshiToBtc
}
