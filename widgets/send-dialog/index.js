'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  })

  ractive.on('cancel', function(event){
    if($(event.original.srcElement).hasClass('modal-cancel')) {
      ractive.set('visible', false)
    }
  })

  ractive.on('open', function(event){
    ractive.set('visible', true)
  })

  return ractive
}
