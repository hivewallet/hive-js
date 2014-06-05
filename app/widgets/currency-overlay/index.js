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
      },
      currency_list: [
        {
          amount: '3',
          currency: 'AUD'
        },
        {
          amount: '2.3',
          currency: 'USD'
        }
      ]
    }
  })

  emitter.on('open-overlay', function(data){
    if(data.overlay === 'currency') {
      ractive.set('visible', true)
    }
  })

  ractive.on('cancel', function(){
    ractive.set('visible', false)
    emitter.emit('close-overlay')
  })

  return ractive
}
