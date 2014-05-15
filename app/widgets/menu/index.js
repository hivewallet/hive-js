'use strict';

var $ = require('browserify-zepto');
var Ractive = require('hive-ractive')
var hasher = require('hive-router').hasher
var router = require('hive-router').router
var emitter = require('hive-emitter')
var FastClick = require('fastclick');

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  var active;
  function highlightTab(node){
    if(node !== active && active && $(active).hasClass('active')) {
      $(active).removeClass('active')
    }

    $(node).addClass('active')
    active = node
  }

  $(ractive.findAll('.tab')).each(function(){
    FastClick(this);
  });

  emitter.on('wallet-ready', function() {
    highlightTab(ractive.nodes.home_tab);
  });

  var menu_animating = false;

  ractive.on('select', function(event){
    event.original.preventDefault();
    if(!menu_animating) {
      emitter.emit('toggle-menu');
      hasher.setHash(event.node.dataset.hash);
      highlightTab(event.node);
    }
  })

  emitter.on('menu_animation_start', function() {
    menu_animating = true;
  });

  emitter.on('menu_animation_end', function(){
    menu_animating = false;
  });

  hasher.changed.add(function(newHash, oldHash){
    highlightTab(ractive.find("[data-hash='" + newHash + "']"))
  })

  return ractive
}
