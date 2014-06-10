'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var initHeader = require('hive-header')
var initTabs = require('hive-tabs')
var initSidebar = require('hive-sidebar')
var initSend = require('hive-send')
var initReceive = require('hive-receive')
var initHistory = require('hive-history')


module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  // widgets
  var header = initHeader(ractive.nodes['header'])
  var tabs = initTabs(ractive.nodes['tabs'])
  var sidebar = initSidebar(ractive.nodes['sidebar'])

  // tabs
  var tabs = {
    send: initSend(ractive.nodes['send']),
    receive: initReceive(ractive.nodes['receive']),
    history: initHistory(ractive.nodes['history'])
  }

  var currentPage = tabs.send
  showPage(tabs.send)

  emitter.on('change-tab', function(tab) {
    showPage(tabs[tab])
  })

  function showPage(page){
    currentPage.hide()
    page.show()
    currentPage = page
  }

  // menu toggle
  emitter.on('toggle-menu', function(open) {
    var classes = ractive.find("#main").classList
    if(open) {
      ractive.set('sidebar_open', true)
      classes.add('closed')
    } else {
      ractive.set('sidebar_open', false)
      classes.remove('closed')
    }

    header.toggleIcon(open)
  })

  return ractive
}
