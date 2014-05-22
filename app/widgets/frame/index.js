'use strict';

var Ractive = require('hive-ractive')
var initHeader = require('hive-header')
var menu = require('hive-menu')
var initAuth = require('hive-auth')
var initHome = require('hive-home')
var initTransactions = require('hive-transactions')
var initContacts = require('hive-contacts')
var initSearch = require('hive-search')
var initSettings = require('hive-settings')
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
  menu(ractive.find("#menu"))

  // pages
  var home = initHome(ractive.find("#home"))
  var transactions = initTransactions(ractive.find("#transactions"))
  var contacts = initContacts(ractive.find("#contacts"))
  var search = initSearch(ractive.find("#search"))
  var settings = initSettings(ractive.find("#settings"))


  var currentPage = home

  // routes
  router.addRoute('/home', function(){
    showPage(home)
  })

  router.addRoute('/transactions', function(){
    showPage(transactions)
  })

  router.addRoute('/contacts', function(){
    showPage(contacts)
  })

  router.addRoute('/search', function(){
    showPage(search)
  })

  router.addRoute('/settings', function(){
    showPage(settings)
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
