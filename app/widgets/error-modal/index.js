'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var transitions = require('hive-transitions')

Ractive.transitions.fadeNscale = transitions.fadeNscaleTransition

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      visible: false,
      transitions: {
        fadeNscale: transitions.fadeNscaleTransition
      }
    }
  })

  ractive.on('cancel', function(){
    ractive.set('visible', false)
  })

  emitter.on('open-error', function(data){
    ractive.set('icon', data.icon || 'error_temp')
    ractive.set('title', data.title || 'Whoops!')
    ractive.set('message', data.message)
    ractive.set('visible', true)
  })

  return ractive
}

