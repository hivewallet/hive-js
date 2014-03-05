'use strict';

var Ractive = require('ractify')
var wallet = require('hive-wallet')

module.exports = function(el){
  return new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      user: {
        name: 'Wei Lu',
        address: wallet.generateAddress(),
        email: 'wei@hivewallet.com',
        picture: 'https://pbs.twimg.com/media/BdrFa5WCUAAXFpZ.jpg'
      },
      btcBalance: 0.6,
      fiatBalance: 36
    }
  });
}
