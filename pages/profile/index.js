'use strict';

var Ractive = require('ractify')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var Big = require('big.js')
var currencies = require('hive-ticker-api').currencies
var db = require('hive-db')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      user: {
        name: 'Wei Lu',
        address: '',
        email: 'wei@hivewallet.com',
        picture: 'https://pbs.twimg.com/media/BdrFa5WCUAAXFpZ.jpg'
      },
      currencies: currencies,
      bitcoinBalance: 'unknown',
      fiatBalance: 'unknown',
      exchangeRates: {},
      satoshiToBTC: satoshiToBTC,
      bitcoinToFiat: bitcoinToFiat
    }
  })

  emitter.on('wallet-ready', function(){
    var wallet = getWallet()
    ractive.set('user.address', wallet.currentAddress)
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.observe('selectedFiat', savePreferredCurrency)

  function savePreferredCurrency(currency){
    var id = getWallet().id
    var value = {
      systemInfo: {
        preferredCurrency: currency
      }
    }

    db.upsert(id, value, function(err, response){
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

  return ractive
}
