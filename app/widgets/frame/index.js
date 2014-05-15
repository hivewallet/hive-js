'use strict';

var $ = require('browserify-zepto')
var Ractive = require('hive-ractive')
var header = require('hive-header')
var menu = require('hive-menu')
var sendDialog = require('hive-send-dialog')
var initAuth = require('hive-auth')
var initHome = require('hive-home')
var initTransactions = require('hive-transactions')
var initContacts = require('hive-contacts')
var initSearch = require('hive-search')
var initSettings = require('hive-settings')
var router = require('hive-router').router
var walletExists = require('hive-wallet').walletExists
var emitter = require('hive-emitter')
var Arrival = require('./arrival')

module.exports = function(el){
  var frame = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  // UI initializations

  // auth
  var authEl = document.getElementById("auth")
  var auth
  walletExists(function(exists){
    auth = exists ? initAuth.login(authEl) : initAuth.register(authEl)
    auth.show()
  })

  // widgets
  header(frame.find("#header"))
  menu(frame.find("#menu"))
  // sendDialog(frame.find("#send-dialog"))

  // pages
  var home = initHome(frame.find("#home"))
  var transactions = initTransactions(frame.find("#transactions"))
  var contacts = initContacts(frame.find("#contacts"))
  var search = initSearch(frame.find("#search"))
  var settings = initSettings(frame.find("#settings"))

  var currentPage = home

  // define routes
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

  emitter.on('wallet-ready', function(){
    auth.hide()
    frame.show()
  })

  // shameful hacks
  // temp menu toggle, this should probably be driven through ractive?

  var menuEl = $(frame.find("#menu"))
  var contentEl = $(frame.find("#main"))
  var menu_is_open = false;
  var menu_is_animating = false;

  emitter.on('toggle-menu', function(){
    if(!menu_is_animating){
      emitter.emit('menu_animation_start');
      menu_is_animating = true;
      menu_is_open ? closeMenu() : openMenu();
    }
  });

  // animation callbacks
  function openMenu() {

    menuEl.addClass('is_opening');
    contentEl.addClass('is_about_to_open');
    contentEl.addClass('is_opening');

    Arrival.complete(frame.el, function(){

      contentEl.addClass('hidden');
      contentEl.removeClass('is_about_to_open');
      contentEl.removeClass('is_opening');
      menuEl.removeClass('closed');
      menuEl.removeClass('is_opening');
      menu_is_open = true;

      setTimeout(function(){
        menu_is_animating = false;
        emitter.emit('menu_animation_end');
      }, 100);
    });
  }

  function closeMenu() {

    contentEl.addClass('is_closing');
    menuEl.addClass('is_about_to_close');

    Arrival.complete(frame.el, function() {

      contentEl.removeClass('hidden');
      menuEl.addClass('closed');
      menuEl.removeClass('is_about_to_close');
      menu_is_open = false;

      setTimeout(function(){
        contentEl.removeClass('is_closing');
        menu_is_animating = false;
        emitter.emit('menu_animation_end');
      }, 100);
    });
  }


  return frame
}
