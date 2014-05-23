'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var sync = require('hive-wallet').sync
var Big = require('big.js')
var $ = require('browserify-zepto')

module.exports = function(el){
  var transactions = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      updating_transactions: false,
      transactions: transactions,
      directionVerb: function(direction){
        return {
          incoming: 'Received',
          outgoing: 'Sent'
        }[direction]
      },
      directionClass: function(direction){
        return {
          incoming: 'green',
          outgoing: 'blue'
        }[direction]
      },
      directionIcon: function(direction){
        return {
          incoming: 'plus',
          outgoing: 'minus'
        }[direction]
      },
      formatTimestamp: function(timestamp){
        var date = new Date(timestamp)
        var options = {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }
        return date.toLocaleTimeString(navigator.language, options)
      },
      satoshiToBTC: function(amount){
        var satoshi = new Big(Math.abs(amount))
        return satoshi.times(0.00000001)
      }
    }
  });

  ractive.updateFastclick()

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  emitter.on('update-transactions', function(newTxs) {
    ractive.set('transactions', newTxs)
  })

  return ractive
}
