'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')
var satoshiToBtc = require('hive-convert').satoshiToBtc
var strftime = require('strftime')

module.exports = function showTooltip(data){

  var ractive = new Ractive({
    el: document.getElementById('transaction-detail'),
    partials: {
      content: require('./content.ract').template,
    },
    data: {
      transaction: data,
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
      satoshiToBtc: satoshiToBtc
    }
  })

  ractive.on('close', function(){
    ractive.fire('cancel')
  })

  return ractive
}

