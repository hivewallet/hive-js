'use strict';

var Ractive = require('hive-ractive')
var transitions = require('hive-transitions')
var emitter = require('hive-emitter')

Ractive.transitions.fade = transitions.fade;

module.exports = function(el){
  var nearbys = []
  var xhr_timeout, oval_interval;
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      transitions: {
        fade: transitions.fade
      }
    }
  })

  emitter.on('open-overlay', function(data){
    if(data.overlay === 'detail') {
      ractive.set('visible', true)
      ractive.set('amount', data.amount)
      ractive.set('address', data.address)
    }
  })

  ractive.on('cancel', function(){
    ractive.set('visible', false)
    emitter.emit('close-overlay')
  })

  return ractive
}
