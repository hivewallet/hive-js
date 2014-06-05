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
    var onDismiss = ractive.get('onDismiss')
    if(onDismiss) onDismiss()
  })

  var defaults = {
    error: {
      icon: 'error_temp',
      title: 'Whoops!'
    },
    info: {
      icon: 'info_temp',
      title: 'Just saying...'
    }
  }

  attachHandlerFor('error')
  attachHandlerFor('info')

  function attachHandlerFor(type) {
    emitter.on('open-' + type, function(data){
      ractive.set('icon', data.icon || defaults[type].icon)
      ractive.set('title', data.title || defaults[type].title)
      ractive.set('message', data.message)
      ractive.set('onDismiss', data.onDismiss)
      ractive.set('visible', true)
      ractive.set('type', type)
    })
  }

  document.addEventListener('keydown', function(event){
    if(ractive.get('visible') && enterOrEscape(event.keyCode)){
      ractive.fire('cancel')
    }
  })

  function enterOrEscape(keycode) {
    return (keycode === 13 || keycode === 27)
  }

  return ractive
}

