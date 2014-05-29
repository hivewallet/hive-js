'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var Big = require('big.js')
var emitter = require('hive-emitter')
var db = require('hive-db')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      exchangeRates: {}
    }
  })

  ractive.on('cancel', function(event){
    event.original.preventDefault();
    ractive.set('visible', false)
    emitter.emit('close-overlay')
  })

  emitter.on('open-overlay', function(dialog){
    if(dialog !== 'geo') { return; }

    ractive.set('visible', true)
  })

  ractive.on('select', function(event){
    // get user data and send to send...
    console.log('data here')
  })

  return ractive
}
