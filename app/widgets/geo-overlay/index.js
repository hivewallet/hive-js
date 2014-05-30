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

  ractive.on('search-again',function(event) {
    event.original.preventDefault()
    ractive.set('searching', true)
    ractive.fire('search-nearby')
  })

  var xhr_timeout, oval_interval, cancelled;

  ractive.on('search-nearby', function(){

    setTimeout(function() {
      oval_interval = setInterval(function(){
        ractive.set('oval_visible', true)
        ractive.set('oval_visible', false)
      }, 900)
    }, 200)

    geo.search(function(err, results){
      if(err) return alert(err)

      xhr_timeout = setTimeout(function(){
        clearInterval(oval_interval)
        ractive.set('oval_visible', false)
        console.log(results)
        if(results.length >= 1){
          ractive.set('results', true)
          nearbys = results.map(function(record){
            return record[0]
          })
          ractive.set('nearbys', nearbys)
        }

        ractive.set('searching', false)
      }, 1500)
    })
  })

  ractive.on('close-geo', function(event){
    clearTimeout(xhr_timeout)
    clearInterval(oval_interval)
    ractive.set('nearbys', [])
    ractive.set('oval_visible', false)
    ractive.set('searching', false)
    ractive.set('visible', false)
    emitter.emit('close-overlay')
    geo.remove()
  })


  ractive.on('select', function(event){
    // get user data and send to send...
    event.original.preventDefault()
    var address = event.node.getAttribute( 'data-wallet' )
    emitter.emit('prefill-wallet', address)
    ractive.fire('close-geo')
  })


  window.onbeforeunload = function() {
    geo.remove(true)
  }

  return ractive
}
