'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var initHeader = require('hive-header')
var initTabs = require('hive-tabs')
var initSidebar = require('hive-sidebar')
var initSend = require('hive-send')
var initReceive = require('hive-receive')
var initHistory = require('hive-history')
var initGeoOverlay = require('hive-geo-overlay')
var initConfirmOverlay = require('hive-confirm-overlay')
var initCurrencyOverlay = require('hive-currency-overlay')
var $ = require('browserify-zepto')

var _html = $('html')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  // widgets
  var header = initHeader(ractive.nodes['header'])
  var tabs = initTabs(ractive.nodes['tabs'])
  var sidebar = initSidebar(ractive.nodes['sidebar'])
  var geoOverlay = initGeoOverlay(ractive.nodes['geo-overlay'])
  var confirmOverlay = initConfirmOverlay(ractive.nodes['confirm-overlay'])
  var currencyOverlay = initCurrencyOverlay(ractive.nodes['currency-overlay'])

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

  emitter.on('open-overlay', function(){
    ractive.set('view_state', 'is_hidden')
    _html.addClass('prevent_scroll')
  })

  emitter.on('close-overlay', function(){
    ractive.set('view_state', '')
    _html.removeClass('prevent_scroll')
  })

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
