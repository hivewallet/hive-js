'use strict';

var walletExists = require('hive-wallet').walletExists

var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var auth = require('./widgets/auth')
var initProfile = require('./pages/profile')
var initTransactions = require('./pages/transactions')
var Ticker = require('hive-ticker-api').BitcoinAverage
var emitter = require('hive-emitter')
var router = require('hive-router').router

// UI initializations
menu(document.getElementById("sidebar"))
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
  appEl.style.display = "block";
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
