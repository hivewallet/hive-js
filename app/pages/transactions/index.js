'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var sync = require('hive-wallet').sync
var Big = require('big.js')
var $ = require('browserify-zepto')
var fastclick = require('fastclick')

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

  $(ractive.findAll('.attach_fastclick')).each(function(){
    fastclick(this);
  })

  emitter.on('transactions-loaded', function(newTxs){
    Array.prototype.unshift.apply(transactions, newTxs)
    ractive.update('transactions')
  })

  ractive.on('sync', function(event){
    event.original.preventDefault();
    if(!ractive.get('updating_transactions')) {
      ractive.set('updating_transactions', true) 
      sync(function(err, txs){
        if(err) return alert(err);

        ractive.set('updating_transactions', false)
        ractive.set('transactions', txs)
        emitter.emit('update-balance')
      })
    }
  })

  return ractive
}
