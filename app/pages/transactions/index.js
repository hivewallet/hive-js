'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var sync = require('hive-wallet').sync
var Big = require('big.js')

module.exports = function(el){
  var transactions = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
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
        var satoshi = new Big(Math.abs(amount))
        return satoshi.times(0.00000001)
      }
    }
  });

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  ractive.on('sync', function(){
    sync(function(err, txs){
      if(err) return alert(err);

      ractive.set('transactions', txs)
    })
  })

  return ractive
}
