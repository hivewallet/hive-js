'use strict'

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var qrcode = require('hive-qrcode')
var Hive = require('hive-wallet')
var transitions = require('hive-transitions')

Ractive.transitions.fade = transitions.fade;

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      address: '',
      qrVisible: false,
      transitions: {
        fade: transitions.fade
      }
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('address', getAddress())
  })

  ractive.on('show-qr', function(){
    ractive.set('qrVisible', true)
    emitter.emit('open-modal')

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
    ractive.set('qrVisible', false)
    emitter.emit('close-modal')

  })

  function getAddress(){
    return Hive.getWallet().currentAddress
  }

  return ractive
}
