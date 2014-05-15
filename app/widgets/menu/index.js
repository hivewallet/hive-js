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

  emitter.on('toggle-menu', function(open) {
    var classes = ractive.el.classList
    if(open) {
      classes.add('open')
    } else {
      classes.remove('open')
    }
  })

  ractive.on('select', function(event){
    event.original.preventDefault();
    emitter.emit('toggle-menu', false);
    hasher.setHash(event.node.dataset.hash);
    highlightTab(event.node);
  })

  hasher.changed.add(function(newHash, oldHash){
    highlightTab(ractive.find("[data-hash='" + newHash + "']"))
  })

  return ractive
}
