'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var Big = require('big.js')
var currencies = require('hive-ticker-api').currencies
var db = require('hive-db')
var crypto = require('crypto')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      user: {
        name: '',
        email: '',
        address: '',
        mnemonic: ''
      },
      editingName: false,
      editingEmail: false,
      currencies: currencies,
      exchangeRates: {},
      satoshiToBTC: satoshiToBTC,
      bitcoinToFiat: bitcoinToFiat,
      emailToAvatar: emailToAvatar
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet()
    ractive.set('user.address', wallet.currentAddress)
    ractive.set('user.mnemonic', wallet.getMnemonic())
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  emitter.on('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('selectedFiat', doc.systemInfo.preferredCurrency)
      ractive.set('user.name', doc.userInfo.name)
      ractive.set('user.email', doc.userInfo.email)
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

  ractive.on('submit-name', function(event){
    event.original.preventDefault();

    var details = {
      name: ractive.get('user.name'),
      email: ractive.get('user.email')
    }

    db.set('userInfo', details, function(err, response){
      if(err) return console.error(response)
    })
  })

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

  function setPreferredCurrency(currency){
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
