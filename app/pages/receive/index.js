'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var initSearch = require('hive-search')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
  });

  var search = initSearch(ractive.find("#search"))

  ractive.updateFastclick()

  ractive.on('send', function(event) {
    event.original.preventDefault()
    emitter.emit('open-send-dialog')
  })  

  ractive.on('error', function(event) {
    event.original.preventDefault()  
    emitter.emit('open-error')
  })

  return ractive;
}
