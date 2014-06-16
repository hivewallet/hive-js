'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var satoshiToBtc = require('hive-convert').satoshiToBtc
var strftime = require('strftime')

module.exports = function(el){
  var transactions = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      updating_transactions: false,
      transactions: transactions,
      directionClass: function(direction){
        return {
          incoming: 'green',
          outgoing: 'red'
        }[direction]
      },
      directionIcon: function(direction){
        return {
          incoming: '+',
          outgoing: ''
        }[direction]
      },
      formatTimestamp: function(timestamp){
        var date = new Date(timestamp)
        return strftime('%b %d %l:%M %p', date)
      },
      truncate: function(amount) {
        return amount.toFixed(5)
      },
      set_avatar: function(index) {
        return Math.round(((index / 10) % 1) * 10)
      },
      satoshiToBtc: satoshiToBtc
    }
  })

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  emitter.on('update-transactions', function(newTxs) {
    ractive.set('transactions', newTxs)
  })

  return ractive
}
