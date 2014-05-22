'use strict';

var $ = require('browserify-zepto')
var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  ractive.updateFastclick()

  ractive.on('send', function(event) {
    event.original.preventDefault()
    emitter.emit('open-send-dialog')
  })  

  ractive.on('error', function(event) {
    event.original.preventDefault()  
    emitter.emit('open-error')
  })

  return ractive
}
