'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var Hive = require('hive-wallet')
var showTooltip = require('hive-modal-tooltip')
var showQr = require('hive-modal-qr')
var geo = require('hive-geo')
var showError = require('hive-modal-flash').showError
var showSetDetails = require('hive-modal-set-details')
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
        if(err) return showError({message: 'Could not save your details'})
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
    geo.save(function(err){
      if(err) return handleWaggleError(err)
      ractive.set('connecting', false)
      ractive.set('broadcasting', true)
      ractive.set('btn_message', 'Turn Waggle off')
    })
  }

  window.addEventListener('beforeunload', removeGeoData)

  function removeGeoData() {
    geo.remove(true)
  }

  ractive.on('teardown', function(){
    window.removeEventListener('beforeunload', removeGeoData)
  }, false)

  ractive.on('show-qr', function(){
    showQr({
      address: ractive.get('address')
    })
  })

  ractive.on('help', function() {
    showTooltip({
      message: 'Waggle lets you broadcast your wallet address to other nearby Hive users by comparing GPS data. This data is deleted once you turn Waggle off.'
    })
  })

  function getAddress(){
    return Hive.getWallet().currentAddress
  }

  function handleWaggleError(err) {
    console.error(err)

    var data = {
      title: 'Uh Oh...',
      message: "We could not connect you to Waggle, please check your internet connection."
    }

    showError(data)
    ractive.set('connecting', false)
    ractive.set('broadcasting', false)
    ractive.set('btn_message', 'Turn Waggle on')
  }

  return ractive
}
