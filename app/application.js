'use strict';

var walletExists = require('hive-wallet').walletExists

var $ = require('browserify-zepto');
var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var auth = require('./widgets/auth')
var initProfile = require('./pages/profile')
var initTransactions = require('./pages/transactions')
var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var router = require('hive-router').router
var Arrival = require('./helpers/arrival');
var FastClick = require('./helpers/fastclick');

// UI initializations
menu(document.getElementById("menu"))
sendDialog(document.getElementById("send-dialog"))
var profile = initProfile(document.getElementById("profile"))
var transactions = initTransactions(document.getElementById("transactions"))
var currentPage = profile;
var appEl = document.getElementById("app")
var authEl = document.getElementById("auth")

router.addRoute('/profile', function(){
  showPage(profile)
})

router.addRoute('/transactions', function(){
  showPage(transactions)
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

var toggleEl = $(document.getElementById("menu_btn"))
var menuEl = $(document.getElementById("menu"))
var contentEl = $(document.getElementById("main"))
var menu_is_open = false;
var menu_is_animating = false;

FastClick(document.getElementById("menu_btn"));

toggleEl.on('click', function(){
  if(!menu_is_animating){ 
    menu_is_animating = true;
    menu_is_open ? closeMenu() : openMenu();
  }
});

emitter.on('toggle-menu', function(){
  if(!menu_is_animating){ 
    menu_is_animating = true;
    menu_is_open ? closeMenu() : openMenu();
  }
});

// animation callbacks
function openMenu() {

  menuEl.addClass('is_opening');
  contentEl.addClass('is_about_to_open');
  contentEl.addClass('is_opening');

  var my_func = function(){

    console.log('complete open');
    
    contentEl.addClass('hidden');
    contentEl.removeClass('is_about_to_open');
    contentEl.removeClass('is_opening');
    menuEl.removeClass('closed');
    menuEl.removeClass('is_opening');
    menu_is_open = true;
    menu_is_animating = false;
  }

  Arrival.complete($(appEl), my_func);
}

function closeMenu() { 

  contentEl.addClass('is_closing');
  menuEl.addClass('is_about_to_close');

  var my_func = function() {

    console.log('complete close');
 
    setTimeout(function(){
      contentEl.removeClass('is_closing');
    }, 300);
    contentEl.removeClass('hidden');
    menuEl.addClass('closed');
    menuEl.removeClass('is_about_to_close');
    menu_is_open = false;
    menu_is_animating = false;
  }

  Arrival.complete($(appEl), my_func);
}


