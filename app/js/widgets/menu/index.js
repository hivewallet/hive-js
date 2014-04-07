'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract')
  })

  var active;
  function highlightTab(node){
    if(node !== active && active && $(active).hasClass('active')) {
      $(active).removeClass('active')
    }

    $(node).addClass('active')
    active = node
  }

  ractive.on('select', function(event){
    highlightTab(event.node)
  })

  window.onhashchange = function(){
    highlightTab(ractive.find("a[href='" + location.hash + "']"))
  }

  return ractive
}
