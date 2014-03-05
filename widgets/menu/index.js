'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  })

  var active;
  ractive.on('select', function(event){
    var node;
    node = event.node

    if(node !== active && active && $(active).hasClass('active')) {
      $(active).removeClass('active')
    }

    $(node).addClass('active')
    active = node
  })

  return ractive
}
