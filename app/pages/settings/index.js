'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var db = require('hive-db')
var transitions = require('hive-transitions')
var openDisablePinModal = require('hive-disable-pin-modal')
var showError = require('hive-flash-modal').showError
var Velocity = require('velocity-animate')

Ractive.transitions.fadeNscale = transitions.fadeNscaleTransition

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      user: {
        name: '',
        email: ''
      },
      transitions: {
        fadeNscale: transitions.fadeNscaleTransition
      },
      editingName: false,
      editingEmail: false,
      emailToAvatar: emailToAvatar,
      user_settings: true,
    }
  })

  var $previewEl = ractive.nodes['details-preview']
  var $editEl = ractive.nodes['details-edit']

  var propsAnimateIn = {
    scale: [ 0.8, "spring" ],
    opacity: 1.0
  }
  var propsAnimateOut = {
    scale: 0.2,
    opacity: 0
  }

  emitter.on('wallet-ready', function(){
    var wallet = getWallet()
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  emitter.on('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('user.name', doc.userInfo.firstName)
      ractive.set('user.email', doc.userInfo.email)
      if(ractive.get('user.name')) {
        ractive.set('user_preview', true);
        $previewEl = ractive.nodes['details-preview']
        animateDetails($previewEl, propsAnimateIn, function(){
          ractive.set('animating', false)
        })
      } else {
        animateDetails($editEl, propsAnimateIn, function(){
          ractive.set('animating', false)
        })
      }
    })
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.on('toggle', function(event){
    event.original.preventDefault();
    toggleDropdown(event.node.dataset.target);
  })

  ractive.on('edit-details', function(){
    if(ractive.get('animating')) return;
    animateDetails($previewEl, propsAnimateOut, function(){
      ractive.set('animating', false)
      ractive.set('user_preview', false)
      $editEl = ractive.nodes['details-edit']
      animateDetails($editEl, propsAnimateIn, function(){
        ractive.set('animating', false)
      })
    })
  })

  ractive.on('submit-details', function(){
    if(ractive.get('animating')) return;
    var details = {
      firstName: ractive.get('user.name'),
      email: ractive.get('user.email')
    }

    db.set('userInfo', details, function(err, response){
      if(err) return handleUserError(response)

      animateDetails($editEl, propsAnimateOut, function(){
        ractive.set('animating', false)
        ractive.set('user_preview', true)
        $previewEl = ractive.nodes['details-preview']
        animateDetails($previewEl, propsAnimateIn, function(){
          ractive.set('animating', false)
        })
      })
    })
  })

  function animateDetails(el, props, callback) {
    ractive.set('animating', true)
    Velocity.animate(el, props, 300, "ease", callback)
  }

  function handleUserError(response) {
    var data = {
      title: "Uh Oh!",
      message: "Could not save your details"
    }
    showError(data)
  }

  ractive.on('disable-pin', function(){
    openDisablePinModal()
  })

  function toggleDropdown(node){
    var elem = ractive.nodes[node]
    var dataString = node + ''
    var state = ractive.get(dataString)
    var classes = elem.classList

    if(state) {
      ractive.set(dataString, false)
      classes.remove('open')
    } else {
      ractive.set(dataString, true)
      classes.add('open')
    }
  }

  return ractive
}
