'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emailToAvatar = require('hive-gravatar').emailToAvatar
var transitions = require('hive-transitions')
var emitter = require('hive-emitter')
var geo = require('hive-geo')
var Big = require('big.js')
var db = require('hive-db')

Ractive.transitions.fade = transitions.fade;
Ractive.transitions.dropdown = transitions.dropdown;
Ractive.transitions.pulse = transitions.pulse;

module.exports = function(el){
  var nearbys = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      exchangeRates: {},
      transitions: {
        fade: transitions.fade,
        dropdown: transitions.dropdown,
        pulse: transitions.pulse
      },
      nearbys: nearbys,
      searching: true,
      search_msg: 'Search Nearby',
      emailToAvatar: emailToAvatar
    }
  })

  emitter.on('open-overlay', function(dialog){
    if(dialog === 'geo') {
      ractive.set('searching', true)
      ractive.set('visible', true)
      ractive.fire('search-nearby')
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
    lookupGeo(false)
  })

  var xhr_timeout, oval_interval, cancelled;

  ractive.on('search-nearby', function(){
    setTimeout(function() {
      oval_interval = setInterval(function(){
        ractive.set('oval_visible', true)
        ractive.set('oval_visible', false)
      }, 900)
    }, 200)
    lookupGeo(true)
  })

  ractive.on('close-geo', function(){
    clearTimeout(xhr_timeout)
    clearInterval(oval_interval)
    ractive.set('nearbys', [])
    ractive.set('oval_visible', false)
    ractive.set('searching', false)
    ractive.set('visible', false)
    ractive.set('results', false)
    emitter.emit('close-overlay')
    geo.remove()
  })

  window.onbeforeunload = function() {
    geo.remove(true)
  }

  function lookupGeo(newSearch) {
    geo.search(function(err, results){
      if(err) return alert(err)
      // TODO: handle error in modal
      if(newSearch) {
        // set a brief timeout so it "feels" like we're searching
        xhr_timeout = setTimeout(function(){
          clearInterval(oval_interval)
          ractive.set('oval_visible', false)
          if(results.length >= 1){
            ractive.set('results', true)
            setNearbys(results)
          }
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
