'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var db = require('hive-db')
var openDisablePinModal = require('hive-disable-pin-modal')
var showError = require('hive-flash-modal').showError
var Dropdown = require('hive-transitions/dropdown.js')
var Profile = require('hive-transitions/profileAnimation.js')
var showTooltip = require('hive-tooltip')

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
  Dropdown.show($initialUserEl, $userIcon, ractive)
  Dropdown.hide($initialSecurityEl, $securityIcon, ractive)

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
        Profile.hide($editEl, ractive)
      } else {
        Profile.hide($previewEl, ractive)
      }
    })
  })

  emitter.on('ticker', function(rates){
    ractive.set('exchangeRates', rates)
  })

  ractive.on('help', function() {
    showTooltip({
      message: 'Gravatar is a service that lets you re-use the same avatar across websites and apps by specifying your email.'
    })
  })

  ractive.on('toggle', function(event){
    event.original.preventDefault();
    var arrow = event.node.lastChild.childNodes[0]
    var target = event.node.dataset.target
    toggleDropdown(target, arrow);
  })

  ractive.on('edit-details', function(){
    if(ractive.get('animating')) return;
    Profile.hide($previewEl, ractive, function(){
      Profile.show($editEl, ractive)
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

      Profile.hide($editEl, ractive, function(){
        Profile.show($previewEl, ractive)
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

  function toggleDropdown(node, icon){

    if(ractive.get('animating')) return;

    var elem = ractive.nodes[node]
    var dataString = node + ''
    var state = ractive.get(dataString)

    if(state) {
      ractive.set(dataString, false)
      Dropdown.hide(elem, icon, ractive)
    } else {
      ractive.set(dataString, true)
      Dropdown.show(elem, icon, ractive)
    }
  }

  return ractive
}
