'use strict';

var $ = require('browserify-zepto')
var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var FastClick = require('fastclick')
var Big = require('big.js')
var getWallet = require('hive-wallet').getWallet

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      bitcoinBalance: 'unknown',
      satoshiToBTC: satoshiToBTC,
      menu_closed: true
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet();
    ractive.set('bitcoinBalance', wallet.getBalance())
  });

  FastClick(ractive.nodes.menu_btn)

  ractive.on('toggle', function(event){
    event.original.preventDefault();
    emitter.emit('toggle-menu', ractive.get('menu_closed'))
  })

  function toggleMenu(){
    if(ractive.get('menu_closed')) {
      ractive.set('menu_closed', false);
    } else {
      ractive.set('menu_closed', true);
    }
  }

  function satoshiToBTC(amount){
    var satoshi = new Big(amount)
    return satoshi.times(0.00000001)
  }

  ractive.toggleMenu = toggleMenu

  return ractive
}
