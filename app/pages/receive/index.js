'use strict'

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var qrcode = require('hive-qrcode')
var Hive = require('hive-wallet')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      address: '',
      qrVisible: false
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('address', getAddress())
  })

  ractive.on('show-qr', function(){
    ractive.set('qrVisible', true)

    var qr = qrcode('bitcoin:' + getAddress())
    var container = ractive.find('#qrcontainer')
    container.innerHTML = ''
    container.appendChild(qr)
  })

  ractive.on('hide-qr', function(){
    ractive.set('qrVisible', false)
  })

  function getAddress(){
    return Hive.getWallet().currentAddress
  }

  return ractive
}
