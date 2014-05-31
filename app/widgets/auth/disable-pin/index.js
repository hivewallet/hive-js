'use strict';

var Ractive = require('../auth')
var Hive = require('hive-wallet')
var db = require('hive-db')
var emitter = require('hive-emitter')

module.exports = function(){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
      actions: require('./actions.ract').template
    }
  })

  ractive.on('disable-pin', function(){
    Hive.disablePin(ractive.get('pin'), function(err){
      if(err) return alert('Failed to disable pin');

      alert('Pin disabled. About to reload wallet.')
      window.location.reload()
    })
  })

  ractive.on('back', function(){
    //FIXME: move disable pin to modal
    emitter.emit('close-disable-pin')
  })

  return ractive
}

