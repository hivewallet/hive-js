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
    data: data
  })

  ractive.on('close', function(){
    ractive.fire('cancel')
  })

  return ractive
}

