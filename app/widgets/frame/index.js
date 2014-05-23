'use strict';

var Ractive = require('hive-ractive')
var initHeader = require('hive-header')
var initTabs = require('hive-tabs')
var initSidebar = require('hive-sidebar')
var initAuth = require('hive-auth')
var initSend = require('hive-send')
var initReceive = require('hive-receive')
var initHistory = require('hive-history')
var router = require('hive-router').router
var emitter = require('hive-emitter')
var sendDialog = require('hive-send-dialog')
var errorDialog = require('hive-error-dialog')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  // widgets
  var header = initHeader(ractive.find("#header"))
  initTabs(ractive.find("#tabs"))
  initSidebar(ractive.find("#sidebar"))

  // pages
  var send = initSend(ractive.find("#send"))
  var receive = initReceive(ractive.find("#receive"))
  var history = initHistory(ractive.find("#history"))

  var currentPage = send

  // routes
  router.addRoute('/send', function(){
    showPage(send)
  })

  router.addRoute('/receive', function(){
    showPage(receive)
  })

  router.addRoute('/history', function(){
    showPage(history)
  })

  function showPage(page){
    currentPage.hide()
    page.show()
    currentPage = page
  }

  sendDialog(ractive.find("#send-dialog"))
  errorDialog(ractive.find("#error-dialog"))

  emitter.on('open-send-dialog', function(){
    ractive.set('view_state', 'is_hidden');
  })

  emitter.on('close-send-dialog', function(){
    ractive.set('view_state', '');
  })

  // menu toggle
  emitter.on('toggle-menu', function(open) {
    var classes = ractive.find("#main").classList
    if(open) {
      classes.add('closed')
    } else {
      classes.remove('closed')
    }

    header.toggleIcon(open)
  })

  return ractive
}
