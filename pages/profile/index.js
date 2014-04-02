'use strict';

var Ractive = require('ractify')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var Big = require('big.js')
var currencies = require('hive-ticker-api').currencies
var db = require('hive-db')
var crypto = require('crypto')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      user: {
        firstName: '',
        lastName: '',
        address: '',
        email: '',
        mnemonic: ''
      },
      editingName: false,
      currencies: currencies,
      bitcoinBalance: 'unknown',
      exchangeRates: {},
      satoshiToBTC: satoshiToBTC,
      bitcoinToFiat: bitcoinToFiat,
      emailToAvatar: emailToAvatar,
      formatEmail: formatEmail
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
      ractive.set('user.firstName', doc.userInfo.firstName)
      ractive.set('user.lastName', doc.userInfo.lastName)
      ractive.set('user.email', doc.userInfo.email)
    })
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.observe('selectedFiat', setPreferredCurrency)

  ractive.on('edit-name', function(){
    ractive.set('editingName', true)
  })

  ractive.on('edited-name', function(){
    ractive.set('editingName', false)

    var name = {
      firstName: ractive.get('user.firstName'),
      lastName: ractive.get('user.lastName')
    }
    db.set('userInfo', name, function(err, response){
      if(err) return console.error(response)
    })
  })

  function setPreferredCurrency(currency){
    db.set('systemInfo', {preferredCurrency: currency}, function(err, response){
      if(err) return console.error(response)
    })
  }

  function satoshiToBTC(amount){
    var satoshi = new Big(amount)
    return satoshi.times(0.00000001)
  }

  function bitcoinToFiat(amount, exchangeRate){
    var btc = satoshiToBTC(amount)
    return btc.times(exchangeRate).toFixed(2)
  }

  function formatEmail(email){
    return email.trim().toLowerCase()
  }

  function emailToAvatar(email){
    return [
      'https://www.gravatar.com/avatar/',
      crypto.createHash('md5').update(email).digest('hex'),
      '?size=200'
    ].join('')
  }

  return ractive
}
