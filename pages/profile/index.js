'use strict';

var Ractive = require('ractify')
var wallet = require('hive-wallet')
var emitter = require('hive-emitter')
var Big = require('big.js')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      user: {
        name: 'Wei Lu',
        address: '',
        email: 'wei@hivewallet.com',
        picture: 'https://pbs.twimg.com/media/BdrFa5WCUAAXFpZ.jpg'
      },
      btcBalance: 'unknown',
      fiatBalance: 'unknown',
      satoshiToBTC: function(amount){
        var satoshi = new Big(amount)
        return satoshi.times(0.00000001)
      }
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('user.address', wallet.nextReceiveAddress)
    ractive.set('btcBalance', wallet.balance)
  })

  return ractive
}
