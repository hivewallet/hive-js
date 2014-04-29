'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')
var hasher = require('hive-router').hasher

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
    hasher.setHash(event.node.dataset.hash)
    highlightTab(event.node)
    event.original.preventDefault()
  })

  hasher.changed.add(function(newHash, oldHash){
    highlightTab(ractive.find("[data-hash='" + newHash + "']"))
  })

  return ractive
}
