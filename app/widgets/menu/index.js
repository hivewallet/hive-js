'use strict';

var $ = require('browserify-zepto');
var Ractive = require('ractify')
var hasher = require('hive-router').hasher
var router = require('hive-router').router
var emitter = require('hive-emitter')
var FastClick = require('../../helpers/fastclick');

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

  $(ractive.findAll('.tab')).each(function(){
    FastClick(this);
  });

  ractive.on('select', function(event){
    event.original.preventDefault();
    emitter.emit('toggle-menu');
    hasher.setHash(event.node.dataset.hash);
    highlightTab(event.node);
  })

  hasher.changed.add(function(newHash, oldHash){
    highlightTab(ractive.find("[data-hash='" + newHash + "']"))
  })

  return ractive
}
