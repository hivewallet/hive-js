'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var db = require('hive-db')
var transitions = require('hive-transitions')
var openDisablePinModal = require('hive-disable-pin-modal')
var showError = require('hive-flash-modal').showError

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
      user_settings: true
    }
  })

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
    ractive.set('user_preview', false)
  })

  ractive.on('submit-details', function(){
    var details = {
      firstName: ractive.get('user.name'),
      email: ractive.get('user.email')
    }

    db.set('userInfo', details, function(err, response){
      if(err) return handleUserError(response)

      ractive.set('user_preview', true)
    })
  })

  function handleUserError(response) {
    var data = {
      title: "Uh Oh!",
      message: "Could not save your details"
    }
    showError(data)
    console.error(response)
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
