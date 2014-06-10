'use strict';

var Ractive = require('hive-ractive')
var transitions = require('hive-transitions')

var Modal = Ractive.extend({
  el: document.getElementById('flash-modal'),
  template: require('./index.ract').template,
  partials: {
    content: require('./content.ract').template,
  },
  data: {
    transitions: {
      fadeNscale: transitions.fadeNscaleTransition,
      fade: transitions.fade
    }
  },
  init: function(){
    var self = this

    self.on('cancel', function(event){
      if(event.original.srcElement.classList.contains('_cancel')){
        var onDismiss = self.get('onDismiss')
        if(onDismiss) onDismiss()

        this.teardown()
      }
    })

    document.addEventListener('keydown', keydownHandler)

    self.on('teardown', function () {
      window.removeEventListener('resize', keydownHandler)
    }, false)

    function keydownHandler(event) {
      if(enterOrEscape(event.keyCode)){
        self.fire('cancel')
      }
    }

    function enterOrEscape(keycode) {
      return (keycode === 13 || keycode === 27)
    }
  }
})

module.exports = Modal

