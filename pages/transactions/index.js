'use strict';

var Ractive = require('ractify')
var emitter = require('hive-emitter')
var wallet = require('hive-wallet')

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
        var date = new Date(timestamp)
        var options = {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }
        return date.toLocaleTimeString(navigator.language, options)
      }
    }
  });

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  return ractive
}
