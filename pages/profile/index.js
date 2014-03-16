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
        address: '1Bu3bhwRmevHLAy1JrRB6AfcxfgDG2vXRd',
        email: 'wei@hivewallet.com',
        picture: 'https://pbs.twimg.com/media/BdrFa5WCUAAXFpZ.jpg'
      },
      btcBalance: 0.6,
      fiatBalance: 36
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('user.address', wallet.nextReceiveAddress)
  })

  return ractive
}
