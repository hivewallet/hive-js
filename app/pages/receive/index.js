'use strict'

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var qrcode = require('hive-qrcode')
var Hive = require('hive-wallet')
var geo = require('hive-geo')
var showError = require('hive-flash-modal').showError
var showSetDetails = require('hive-set-details-modal')
var fadeIn = require('hive-transitions/fade.js').fadeIn
var fadeOut = require('hive-transitions/fade.js').fadeOut
var setPulse = require('hive-transitions/fade.js').setPulse
var clearPulse = require('hive-transitions/fade.js').clearPulse

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

  var waggleInterval;

  function waggleOff(){
    ractive.set('broadcasting', false)
    ractive.set('btn_message', 'Turn Waggle on')
    geo.remove(true)
  }

  function waggleOn(){
    ractive.set('connecting', true)
    ractive.set('btn_message', 'Connecting to Waggle')
    geo.search(function(err, results){
      if(err) return handleWaggleError(err)
      ractive.set('connecting', false)
      ractive.set('broadcasting', true)
      ractive.set('btn_message', 'Turn Waggle off')
    })
  }

  ractive.on('show-qr', function(){
    var data = {
      overlay: 'qr'
    }

    ractive.set('qrVisible', true)
    emitter.emit('open-overlay', data)

    fadeIn(ractive.nodes['qr-modal'])

    var qr = qrcode('bitcoin:' + getAddress())
    var container = ractive.find('#qrcontainer')
    container.innerHTML = ''
    container.appendChild(qr)
    setTimeout(function(){
      container.classList.add('is_visible')
    }, 100)
  })

  ractive.on('hide-qr', function(){
    var container = ractive.find('#qrcontainer')
    container.classList.remove('is_visible')
    fadeOut(ractive.nodes['qr-modal'], function() {
      ractive.set('qrVisible', false)
      emitter.emit('close-overlay')
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
