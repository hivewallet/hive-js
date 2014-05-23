'use strict';

var $ = require('browserify-zepto');
var Ractive = require('hive-ractive')
var hasher = require('hive-router').hasher
var router = require('hive-router').router
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  ractive.updateFastclick()

  emitter.on('toggle-menu', function(open) {
    var classes = ractive.el.classList
    if(open) {
      classes.add('open')
    } else {
      classes.remove('open')
    }
  })

  return ractive
}
