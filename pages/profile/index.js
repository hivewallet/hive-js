'use strict';

var Ractive = require('ractify')
var wallet = require('hive-wallet')
var emitter = require('hive-emitter')

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
      fiatBalance: 'unknown'
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('user.address', wallet.nextReceiveAddress)
    ractive.set('btcBalance', wallet.balance * 0.00000001)
  })

  return ractive
}
