'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var db = require('hive-db')
var openDisablePinModal = require('hive-disable-pin-modal')
var showError = require('hive-flash-modal').showError
var Velocity = require('velocity-animate')
var $ = require('browserify-zepto')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      user: {
        name: '',
        email: ''
      },
      editingName: false,
      editingEmail: false,
      emailToAvatar: emailToAvatar,
      animating: false,
      user_settings: true
    }
  })

  var $previewEl = ractive.nodes['details-preview']
  var $editEl = ractive.nodes['details-edit']

  var propsAnimateIn = {
    scale: [1.0, 'spring'],
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
      var hiddenState = {
          display: 'none',
          opacity: 0
        }
      if(ractive.get('user.name')) {
        hideDetails($editEl)
      } else {
        hideDetails($previewEl)
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
    hideDetails($previewEl, function(){
      showDetails($editEl)
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

      hideDetails($editEl, function(){
        showDetails($previewEl)
      })
    })
  })

  function showDetails(el, callback){
    animateDetails(el, propsAnimateIn, 'block', callback)
  }

  function hideDetails(el, callback){
    animateDetails(el, propsAnimateOut, 'none', callback)
  }

  function animateDetails(el, props, display, callback) {
    ractive.set('animating', true)
    Velocity.animate(el, props, {
      easing: "ease",
      duration: 300,
      complete: function(){
        ractive.set('animating', false)
        if(callback) callback()
      },
      display: display
    })
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

    if(ractive.get('animating')) return;
    var elem = ractive.nodes[node]
    var dataString = node + ''
    var state = ractive.get(dataString)
    var classes = elem.classList

    if(state) {
      ractive.set(dataString, false)
      classes.remove('open')
      hideDropdown(elem)
    } else {
      ractive.set(dataString, true)
      classes.add('open')
      showDropdown(elem)
    }
  }

  showDropdown(ractive.nodes['user_settings'])
  hideDropdown(ractive.nodes['security_settings'])

  function showDropdown(el, callback){
    animateDropdown(el, {maxHeight: '500px'}, {translateY: 0}, 'block', callback)
  }

  function hideDropdown(el, callback){
    animateDropdown(el, {maxHeight: '0px'}, {translateY: '-100%'}, 'none', callback)
  }

  function animateDropdown(el, props, childProps, display, callback) {

    ractive.set('animating', true)
    var childEl = el.childNodes[0]

    Velocity.animate(el, props, {
      easing: "ease",
      duration: 400,
      display: display
    })

    Velocity.animate(childEl, childProps, {
      easing: "ease",
      duration: 300,
      delay: 100,
      complete: function(){
        ractive.set('animating', false)
        if(callback) callback()
      }
    })
  }

  return ractive
}
