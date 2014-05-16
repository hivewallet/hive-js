'use strict';

var $ = require('browserify-zepto')
var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var fastclick = require('fastclick')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  $(ractive.findAll('.attach_fastclick')).each(function(){
    fastclick(this);
  })

  ractive.on('send', function(event) {
    event.original.preventDefault();
    emitter.emit('open-send-dialog');
  })

  return ractive
}
