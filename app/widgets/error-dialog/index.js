'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var $ = require('browserify-zepto')


Ractive.transitions.fadeNscale = fadeNscaleTransition

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      visible: false,
      transitions: {
        fadeNscale: fadeNscaleTransition
      }
    }
  })

  ractive.updateFastclick()

  ractive.on('cancel', function(event){
    event.original.preventDefault()
    ractive.set('visible', false)
    emitter.emit('close-error-dialog')
  })

  emitter.on('open-error', function(data){
    ractive.set('visible', true)
    ractive.updateFastclick()
  })

  return ractive
}


function fadeNscaleTransition(t, params) {
  var props, 
      options;

  // Process parameters (second argument provides defaults)
  params = t.processParams( params, {
    duration: 300,
    opacity: t.isIntro ? 1.0 : 0
  });

  props = {
    opacity: params.opacity
  }

  options = {
    duration: params.duration,
    easing: 'linear'
  }

  // Then, we execute the transition itself
  t.animateStyle(props, options, t.complete(true));
}
