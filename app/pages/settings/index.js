'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var Big = require('big.js')
var currencies = require('hive-ticker-api').currencies
var db = require('hive-db')
var crypto = require('crypto')
var transitions = require('hive-transitions')

Ractive.transitions.fadeNscale = transitions.fadeNscaleTransition

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      user: {
        name: '',
        email: ''
      },
      transitions: {
        fadeNscale: transitions.fadeNscaleTransition
      },
      editingName: false,
      editingEmail: false,
      currencies: currencies,
      exchangeRates: {},
      satoshiToBTC: satoshiToBTC,
      bitcoinToFiat: bitcoinToFiat,
      emailToAvatar: emailToAvatar,
      user_settings: true
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet()
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  emitter.on('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('selectedFiat', doc.systemInfo.preferredCurrency)
      ractive.set('user.name', doc.userInfo.firstName)
      ractive.set('user.email', doc.userInfo.email)
      if(ractive.get('user.name')) {
        ractive.set('user_preview', true);
      }
    })
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.observe('selectedFiat', setPreferredCurrency)

  ractive.on('toggle', function(event){
    event.original.preventDefault();
    toggleDropdown(event.node.dataset.target);
  })

  ractive.on('edit-details', function(){
    ractive.set('user_preview', false)
  })

  ractive.on('submit-details', function(){
    var details = {
      firstName: ractive.get('user.name'),
      email: ractive.get('user.email')
    }

    db.set('userInfo', details, function(err, response){
      if(err) return handleUserError(response)

      ractive.set('user_preview', true)
    })
  })

  function handleUserError(response) {
    var data = {
      title: "Uh Oh!",
      message: "Could not save your details"
    }
    emitter.emit('open-error', data)
    console.error(response)
  }

  ractive.on('disable-pin', function(){
    //FIXME: move this into modal
    emitter.emit('open-disable-pin')
  })

  function toggleDropdown(node){
    var elem = ractive.nodes[node]
    var dataString = node + ''
    var state = ractive.get(dataString)
    var classes = elem.classList

    if(state) {
      ractive.set(dataString, false)
      classes.remove('open')
    } else {
      ractive.set(dataString, true)
      classes.add('open')
    }
  }

  function setPreferredCurrency(currency, old){
    if(old == undefined) return; //when loading wallet

    db.set('systemInfo', {preferredCurrency: currency}, function(err, response){
      if(err) return console.error(response);

      emitter.emit('preferred-currency-changed', currency)
    })
  }

  function satoshiToBTC(amount){
    if(amount == undefined) return;

    var satoshi = new Big(amount)
    return satoshi.times(0.00000001)
  }

  function bitcoinToFiat(amount, exchangeRate){
    if(amount == undefined) return;

    var btc = satoshiToBTC(amount)
    return btc.times(exchangeRate).toFixed(2)
  }

  return ractive
}
