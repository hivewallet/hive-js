'use strict';

var Ractive = require('hive-ractive')
var getAvatar = require('hive-avatar').getAvatar
var emitter = require('hive-emitter')
var geo = require('hive-geo')
var showError = require('hive-modal-flash').showError
var fadeIn = require('hive-transitions/fade.js').fadeIn
var fadeOut = require('hive-transitions/fade.js').fadeOut
var animatePin = require('hive-transitions/pinDrop.js').drop
var resetPin = require('hive-transitions/pinDrop.js').reset

module.exports = function(el){
  var nearbys = []
  var xhr_timeout;
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      exchangeRates: {},
      nearbys: nearbys,
      searching: true,
      getAvatar: getAvatar
    }
  })

  emitter.on('open-overlay', function(data){
    if(data.overlay === 'geo') {
      ractive.set('searching', true)
      fadeIn(ractive.find('.js__fadeEl'), function() {
        ractive.set('search_message', 'Searching your area for other Hive Web users')
        ractive.fire('search-nearby')
      })
    }
  })

  ractive.on('select', function(event){
    event.original.preventDefault()
    var address = event.node.getAttribute( 'data-wallet' )
    emitter.emit('prefill-wallet', address)
    ractive.fire('close-geo')
  })

  ractive.on('search-again',function(event) {
    event.original.preventDefault()
    ractive.set('searching', true)
    ractive.fire('search-nearby')
  })

  ractive.on('refresh-list', function(event) {
    event.original.preventDefault()
    ractive.set('updating_nearbys', true)
    lookupGeo(undefined)
  })

  ractive.on('search-nearby', function(){
    var pinEl = ractive.nodes['geo-pin']
    var pulseEl = ractive.nodes['geo-pulse']
    resetPin(pinEl, function() {
      animatePin(pinEl, pulseEl)
    })
    lookupGeo('new')
  })

  ractive.on('close-geo', function(){
    fadeOut(ractive.find('.js__fadeEl'), function(){
      if(ractive.get('searching')) {
        var pinEl = ractive.nodes['geo-pin']
        resetPin(pinEl)
      }
      ractive.set('nearbys', [])
      ractive.set('searching', false)
      ractive.set('results', false)
      emitter.emit('close-overlay')
      geo.remove()
    })

  })

  window.onbeforeunload = function() {
    geo.remove(true)
  }

  function lookupGeo(context) {
    geo.search(function(err, results){
      if(err) {
        return showError({
          message: err.message,
          onDismiss: function(){
            ractive.fire('close-geo')
          }
        })
      }

      if(context === 'new') {
        // set a brief timeout so it "feels" like we're searching
        xhr_timeout = setTimeout(function(){
          if(results.length >= 1){
            ractive.set('results', true)
            setNearbys(results)
          }
          var pinEl = ractive.nodes['geo-pin']
          resetPin(pinEl)
          ractive.set('searching', false)
        }, 1500)
      } else {
        if(results.length >= 1){
          setNearbys(results)
        } else {
          ractive.set('nearbys', [])
          ractive.set('results', false)
        }
        ractive.set('updating_nearbys', false)
      }
    })
  }

  function setNearbys(results) {
    nearbys = results.map(function(record){
      return record[0]
    })
    ractive.set('nearbys', nearbys)
  }

  return ractive
}
