'use strict';

var walletExists = require('hive-wallet').walletExists
var $ = require('browserify-zepto');
var header = require('./widgets/header')
var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var auth = require('./widgets/auth')
var initHome = require('./pages/home')
var initTransactions = require('./pages/transactions')
var initContacts = require('./pages/contacts')
var initSearch = require('./pages/search')
var initSettings = require('./pages/settings')
var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var router = require('hive-router').router
var Arrival = require('./helpers/arrival')
var FastClick = require('fastclick')

// remove hash to avoid router bugs
if (location.hash) {
  var loc = window.location
  if ("pushState" in history) {
      history.pushState("", document.title, loc.pathname + loc.search)
  }
}

// UI initializations

// widgets
header(document.getElementById("header"))
menu(document.getElementById("menu"))
sendDialog(document.getElementById("send-dialog"))

// pages
var home = initHome(document.getElementById("home"))
var transactions = initTransactions(document.getElementById("transactions"))
var contacts = initContacts(document.getElementById("contacts"))
var search = initSearch(document.getElementById("search"))
var settings = initSettings(document.getElementById("settings"))

var currentPage = home

// non-ractive elements
var appEl = document.getElementById("app")
var authEl = document.getElementById("auth")

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

// Wallet ops
walletExists(function(exists){
  exists ? auth.login(authEl) : auth.register(authEl)
})

emitter.on('wallet-ready', function(){
  authEl.style.display = "none";
  $(appEl).addClass('open')
})

function updateExchangeRates(){
  var tickerUpdateInterval = 1000 * 60 * 2
  var ticker = new Ticker()

  ticker.getExchangeRates(function(err, rates){
    emitter.emit('ticker', rates)
    window.setTimeout(updateExchangeRates, tickerUpdateInterval)
  })
}

updateExchangeRates()


// shameful hacks
// temp menu toggle, this should probably be driven through ractive?

var menuEl = $(document.getElementById("menu"))
var contentEl = $(document.getElementById("main"))
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

  Arrival.complete(appEl, function(){
    
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

  Arrival.complete(appEl, function() {

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


