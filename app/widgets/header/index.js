'use strict';

var $ = require('browserify-zepto'),
    Ractive = require('ractify'),
    emitter = require('hive-emitter'),
    FastClick = require('../../helpers/fastclick'),
    Big = require('big.js'),
    getWallet = require('hive-wallet').getWallet;

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      bitcoinBalance: 'unknown',
      satoshiToBTC: satoshiToBTC,
      menu_icon: 'rows'
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet();
    ractive.set('bitcoinBalance', wallet.getBalance());
  });

  FastClick(ractive.nodes.menu_btn);

  var menu_animating = false;
  var menu_closed = true;

  ractive.on('toggle', function(event){
    event.original.preventDefault();
    emitter.emit('toggle-menu');
  });

  emitter.on('menu_animation_start', function() {
    menu_animating = true;
  });

  emitter.on('menu_animation_end', function(){
    menu_animating = false;
  });

  emitter.on('toggle-menu', function(){
    if(!menu_animating) {
      if(menu_closed) {
        ractive.set('menu_icon', 'left');
        menu_closed = false;
      } else {
        ractive.set('menu_icon', 'rows');
        menu_closed = true;
      }
    }
  });

  function satoshiToBTC(amount){
    var satoshi = new Big(amount)
    return satoshi.times(0.00000001)
  }

  return ractive
}
