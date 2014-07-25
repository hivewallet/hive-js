'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var toFixedFloor = require('hive-convert').toFixedFloor
var satoshiToBtc = require('hive-convert').satoshiToBtc
var strftime = require('strftime')
var showTransactionDetail = require('hive-modal-transaction-detail')

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
        if(Math.abs(amount) > 0.00001) {
          return toFixedFloor(amount, 5)
        } else {
          return amount
        }
      },
      satoshiToBtc: satoshiToBtc
    }
  })

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.set('transactions', transactions)
  })

  emitter.on('update-transactions', function(newTxs) {
    ractive.set('transactions', newTxs)
  })

  ractive.on('show-detail', function(event) {
    var index = event.node.getAttribute('data-index')
    var data = ractive.data
    data.transaction = ractive.get('transactions')[index]
    showTransactionDetail(data)
  })

  return ractive
}
