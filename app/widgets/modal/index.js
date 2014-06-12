'use strict';

var Ractive = require('hive-ractive')

var Modal = Ractive.extend({
  el: document.getElementById('general-purpose-overlay'),
  template: require('./index.ract').template,
  partials: {
    content: require('./content.ract').template,
  },
  init: function(){
    var self = this

    var htmlEl = document.getElementsByTagName('html')[0]
    var appEl = document.getElementById('app')

    appEl.classList.add('is_hidden')
    htmlEl.classList.add('prevent_scroll')

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

      appEl.classList.remove('is_hidden')
      htmlEl.classList.remove('prevent_scroll')
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

