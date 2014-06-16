'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var db = require('hive-db')
var openDisablePinModal = require('hive-disable-pin-modal')
var showError = require('hive-flash-modal').showError
var Velocity = require('velocity-animate')

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
  var $initialUserEl = ractive.nodes['user_settings']
  var $initialSecurityEl = ractive.nodes['security_settings']
  var $userIcon = ractive.nodes['user_arrow']
  var $securityIcon = ractive.nodes['security_arrow']

  // animate on load to avoid style property bugs
  showDropdown($initialUserEl, $userIcon)
  hideDropdown($initialSecurityEl, $securityIcon)

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
    var arrow = event.node.lastChild.childNodes[0]
    var target = event.node.dataset.target
    toggleDropdown(target, arrow);
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

  ractive.on('disable-pin', function(){
    openDisablePinModal()
  })

  function handleUserError(response) {
    var data = {
      title: "Uh Oh!",
      message: "Could not save your details"
    }
    showError(data)
  }

  function showDetails(el, callback){
    animateDetails(el, {
      scale: [1.0, 'spring'],
      opacity: 1.0
    }, 'block', callback)
  }

  function hideDetails(el, callback){
    animateDetails(el, {
      scale: 0.2,
      opacity: 0
    }, 'none', callback)
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

  function toggleDropdown(node, icon){

    if(ractive.get('animating')) return;
    var elem = ractive.nodes[node]
    var dataString = node + ''
    var state = ractive.get(dataString)

    if(state) {
      ractive.set(dataString, false)
      hideDropdown(elem, icon)
    } else {
      ractive.set(dataString, true)
      showDropdown(elem, icon)
    }
  }

  function showDropdown(el, icon){
    var props = {
      icon: {rotateZ: '180deg'},
      container: {maxHeight: '500px'},
      content: {translateY: 0}
    }
    var options = {
      display: 'block'
    }
    animateDropdown(el, icon, props, options)
  }

  function hideDropdown(el, icon){
    var props = {
      icon: {rotateZ: '0deg'},
      container: {maxHeight: '0px'},
      content: {translateY: '-100%'}
    }
    var options = {
      display: 'none',
      contentDelay: 200
    }
    animateDropdown(el, icon, props, options)
  }

  function animateDropdown(el, icon, props, options) {

    ractive.set('animating', true)
    var childEl = el.childNodes[0]

    // arrow
    Velocity.animate(icon, props.icon, {
      easing: "ease",
      duration: 300
    })

    // container
    Velocity.animate(el, props.container, {
      easing: "linear",
      duration: 400,
      display: options.display
    })

    // content
    Velocity.animate(childEl, props.content, {
      easing: "ease",
      duration: 300,
      delay: options.contentDelay || undefined,
      complete: function(){
        ractive.set('animating', false)
      }
    })
  }

  return ractive
}
