'use strict'

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var qrcode = require('hive-qrcode')
var Hive = require('hive-wallet')
var transitions = require('hive-transitions')
var geo = require('hive-geo')

Ractive.transitions.fade = transitions.fade;

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      address: '',
      qrVisible: false,
      btn_message: 'Turn waggle on',
      connecting: false,
      broadcasting: false,
      transitions: {
        fade: transitions.fade
      }
    }
  })

  emitter.on('wallet-ready', function(){
    ractive.set('address', getAddress())
  })

  ractive.on('toggle-broadcast', function(){
    if(ractive.get('connecting')) return;
    if(ractive.get('broadcasting')) {
      ractive.set('broadcasting', false)
      ractive.set('btn_message', 'Turn waggle on')
      geo.remove(true)
    } else {
      ractive.set('connecting', true)
      ractive.set('btn_message', 'Connecting to waggle')
      geo.search(function(err, results){
        if(err) return handleWaggleError(err)
        ractive.set('connecting', false)
        ractive.set('broadcasting', true)
        ractive.set('btn_message', 'Waggle is broadcasting')
      })
    }
  })

  ractive.on('show-qr', function(){
    var data = {
      overlay: 'qr'
    }

    ractive.set('qrVisible', true)
    emitter.emit('open-overlay', data)

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
    emitter.emit('close-overlay')
  })

  function getAddress(){
    return Hive.getWallet().currentAddress
  }

  function handleWaggleError(err) {
    console.log(err)

    var data = {
      title: 'Uh Oh...',
      message: "We couldn't connect you to waggle, please check your internet connection."
    }

    emitter.emit('open-error', data)
    ractive.set('connecting', false)
    ractive.set('broadcasting', false)
    ractive.set('btn_message', 'Turn waggle on')
  }

  return ractive
}
