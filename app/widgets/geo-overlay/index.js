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
      ractive.set('visible', true)
      ractive.fire('search-nearby')
    }
  })

  ractive.on('search-nearby', function(){

    ractive.set('searching', true)
    var oval_interval = function(){
        ractive.set('oval_visible', false)
        ractive.set('oval_visible', true)
    }
    // lol... hacky animation loop
    setTimeout(function() {
      ractive.set('oval_visible', true)
      oval_interval = setInterval(oval_interval, 1000)
    }, 1000)

    geo.search(function(err, results){
      if(err) return alert(err)

      setTimeout(function(){
        clearInterval(oval_interval)
        ractive.set('oval_visible', false)
        ractive.set('searching', false)
        ractive.set('results', true)
        nearbys = results.map(function(record){
          return record[0]
        })
        ractive.set('nearbys', nearbys)
      }, 3000)
    })
  })

  ractive.on('close-geo', function(event){
    geo.remove()
    ractive.set('visible', false)
    ractive.set('results', false)
    emitter.emit('close-overlay')
  })


  ractive.on('select', function(event){
    // get user data and send to send...
    event.original.preventDefault()
    var address = event.node.getAttribute( 'data-wallet' )
    emitter.emit('prefill-wallet', address)
    ractive.fire('close-geo')
  })


  window.onbeforeunload = function() {
    geo.remove()
  }

  return ractive
}
