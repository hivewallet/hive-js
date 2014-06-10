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
      if(!event || event.original.srcElement.classList.contains('_cancel')){
        dismissModal()
      }
    })

    document.addEventListener('keydown', keydownHandler)

    self.on('teardown', function () {
      window.removeEventListener('keydown', keydownHandler)
    }, false)

    function dismissModal(){
      var onDismiss = self.get('onDismiss')
      if(onDismiss) onDismiss();

      self.teardown()
    }

    function keydownHandler(event) {
      if(event.keyCode === 27){ //esc
        dismissModal()
      }
    }
  }
})

module.exports = Modal

