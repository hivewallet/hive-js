'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')

module.exports = function(){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
    }
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
      var config = {
        onOpen: function(){
          ractive.set('icon', data.icon || defaults[type].icon)
          ractive.set('title', data.title || defaults[type].title)
          ractive.set('message', data.message)
          ractive.set('type', type)
        },
        onDismiss: data.onDismiss
      }

      emitter.emit('open-modal', config)
    })
  }

  return ractive
}

