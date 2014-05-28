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

  ractive.on('cancel', function(event){
    event.original.preventDefault()
    ractive.set('visible', false)
    emitter.emit('close-error-dialog')
  })

  emitter.on('open-error', function(data){
    ractive.set('visible', true)
  })

  return ractive
}


function fadeNscaleTransition(t, params) {

  var targetStyle, props, collapsed, defaults;

  defaults = {
    duration: 200,
    easing: 'linear'
  };

  props = [
    'opacity',
    'transform'
  ];

  collapsed = {
    opacity: 0,
    transform: 'scale(0.8)'
  };

  params = t.processParams( params, defaults );

  if ( t.isIntro ) {
    targetStyle = t.getStyle( props );
    t.setStyle( collapsed );
  } else {
    // make style explicit, so we're not transitioning to 'auto'
    t.setStyle( t.getStyle( props ) );
    targetStyle = collapsed;
  }

  t.animateStyle( targetStyle, params ).then( t.complete );
}
