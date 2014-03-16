'use strict';

var Ractive = require('ractify')
var emitter = require('hive-emitter')
var wallet = require('hive-wallet')
var Big = require('big.js')

module.exports = function(el){
  var transactions = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      transactions: transactions,
      directionVerb: function(direction){
        return {
          incoming: 'Received',
          outgoing: 'Sent'
        }[direction]
      },
      directionClass: function(direction){
        return {
          incoming: 'fa fa-plus-circle',
          outgoing: 'fa fa-minus-circle'
        }[direction]
      },
      formatTimestamp: function(timestamp){
        var date = new Date((new Big(timestamp)) * 1000)
        var options = {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }
        return date.toLocaleTimeString(navigator.language, options)
      },
      satoshiToBTC: function(amount){
        var satoshi = new Big(amount)
        return satoshi.times(0.00000001)
      }
    }
  });

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  return ractive
}
