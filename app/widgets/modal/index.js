'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var transitions = require('hive-transitions')

var Modal = Ractive.extend({
  el: document.getElementById('flash-modal'),
  template: require('./index.ract').template,
  partials: {
    content: require('./content.ract').template,
  },
  data: {
    visible: false,
    transitions: {
      fadeNscale: transitions.fadeNscaleTransition,
      fade: transitions.fade
    }
  },
  init: function(){
    var self = this

    self.on('cancel', function(){
      self.set('visible', false)
      var onDismiss = self.get('onDismiss')
      if(onDismiss) onDismiss()
    })

    emitter.on('open-modal' , function(data){
      if(data.onOpen) {
        data.onOpen()
      }

      self.set('onDismiss', data.onDismiss)
      self.set('visible', true)
    })

    document.addEventListener('keydown', function(event){
      if(self.get('visible') && enterOrEscape(event.keyCode)){
        self.fire('cancel')
      }
    })

    function enterOrEscape(keycode) {
      return (keycode === 13 || keycode === 27)
    }
  }
})

module.exports = Modal

