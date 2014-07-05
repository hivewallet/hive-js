'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var initSettings = require('hive-settings')
var openSupportModal = require('hive-support-modal')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  initSettings(ractive.find("#settings"))

  ractive.on('open-support', function(){
    openSupportModal()
  })

  ractive.on('logout', function(event){
    event.original.preventDefault()
    window.location.reload()
  })

  emitter.on('toggle-menu', function(open) {
    var classes = ractive.el.classList
    if(open) {
      classes.add('open')
    } else {
      classes.add('animating')
      classes.remove('open')
      setTimeout(function(){
        classes.remove('animating')
      }, 300)
    }
  })

  return ractive
}
