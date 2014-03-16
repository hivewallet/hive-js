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
      transactions: transactions
    }
  });

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  return ractive
}
