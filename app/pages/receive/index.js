'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var Hive = require('hive-wallet')
var showTooltip = require('hive-tooltip')
var showQr = require('hive-qr-modal')
var geo = require('hive-geo')
var showError = require('hive-flash-modal').showError
var showSetDetails = require('hive-set-details-modal')
var fadeIn = require('hive-transitions/fade.js').fadeIn
var fadeOut = require('hive-transitions/fade.js').fadeOut

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      address: '',
      qrVisible: false,
      btn_message: 'Turn Waggle on',
      connecting: false,
      broadcasting: false
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('address', getAddress())
  })

  ractive.on('toggle-broadcast', function(){
    if(ractive.get('connecting')) return;

    if(ractive.get('broadcasting')) {
      waggleOff()
    } else {
      showSetDetails(function(err){
        if(err) return showError({message: 'Failed to save your details'})
        waggleOn()
      })
    }
  })

  function waggleOff(){
    ractive.set('broadcasting', false)
    ractive.set('btn_message', 'Turn Waggle on')
    geo.remove(true)
  }

  function waggleOn(){
    ractive.set('connecting', true)
    ractive.set('btn_message', 'Checking your location')
    geo.search(function(err){
      if(err) return handleWaggleError(err)
      ractive.set('connecting', false)
      ractive.set('broadcasting', true)
      ractive.set('btn_message', 'Turn Waggle off')
    })
  }

  ractive.on('show-qr', function(){
    showQr({
      address: ractive.get('address')
    })
  })

  ractive.on('help', function() {
    showTooltip({
      message: 'Waggle lets you broadcast your wallet address to other nearby Hive users by comparing GPS data. This data it is deleted once you turn Waggle off.'
    })
  })

  function getAddress(){
    return Hive.getWallet().currentAddress
  }

  function handleWaggleError(err) {
    console.log(err)

    var data = {
      title: 'Uh Oh...',
      message: "We couldn't connect you to Waggle, please check your internet connection."
    }

    showError(data)
    ractive.set('connecting', false)
    ractive.set('broadcasting', false)
    ractive.set('btn_message', 'Turn Waggle on')
  }

  return ractive
}
