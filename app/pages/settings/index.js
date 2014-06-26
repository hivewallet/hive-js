'use strict';

var Ractive = require('hive-ractive')
var getWallet = require('hive-wallet').getWallet
var emitter = require('hive-emitter')
var Avatar = require('hive-avatar')
var db = require('hive-db')
var showError = require('hive-flash-modal').showError
var Dropdown = require('hive-transitions/dropdown.js')
var Profile = require('hive-transitions/profileAnimation.js')
var showTooltip = require('hive-tooltip')
var getNetwork = require('hive-network')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      user: {
        name: '',
        email: ''
      },
      tokens: [
        {
          token: 'bitcoin',
          bitcoin: true
        },
        {
          token: 'litecoin',
          litecoin: true
        }
      ],
      editingName: false,
      editingEmail: false,
      animating: false,
      user_settings: true,
      capitalize: function(str){
        return str.replace(/^.|\s\S/g, function(a) {
         return a.toUpperCase()
        })
      },
      getNetworkClass: function(elId){
        return getNetwork() === elId ? "current" : ""
      }
    }
  })

  var $previewEl = ractive.nodes['details-preview']
  var $editEl = ractive.nodes['details-edit']
  var $initialUserEl = ractive.nodes['user_settings']
  var $initialSecurityEl = ractive.nodes['security_settings']
  var $initialTokenEl = ractive.nodes['token_settings']
  var $userIcon = ractive.nodes['user_arrow']
  var $tokenIcon = ractive.nodes['token_arrow']

  // animate on load to avoid style property bugs
  Dropdown.show($initialUserEl, $userIcon, ractive)
  Dropdown.hide($initialTokenEl, $tokenIcon, ractive)

  emitter.on('wallet-ready', function(){
    var wallet = getWallet()
    ractive.set('bitcoinBalance', wallet.getBalance())
  })

  emitter.on('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('user.name', doc.userInfo.firstName)
      ractive.set('user.email', doc.userInfo.email)
      ractive.set('user.avatarIndex', doc.userInfo.avatarIndex)

      setAvatar()

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
      message: 'Gravatar (globally recognised avatar) is a service that lets you re-use the same avatar across websites and apps by specifying an email address.',
      link: {
        text: 'Create a gravatar',
        url: 'https://en.gravatar.com/'
      }
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

  emitter.on('details-updated', function(details){
    ractive.set('user.name', details.firstName)
    Profile.hide($editEl, ractive, function(){
      Profile.show($previewEl, ractive)
    })
  })

  ractive.on('submit-details', function(){
    if(ractive.get('animating')) return;

    var email = ractive.get('user.email')

    var details = {
      firstName: ractive.get('user.name') + '',
      email: email
    }

    if(!details.firstName || details.firstName.trim() === 'undefined') {
      details.firstName = '';
      db.set('userInfo', details, function(err, response){
        if(err) return handleUserError(response)
      })
      return showError({message: "A name is required to set your profile on Hive"})
    }

    var avatarIndex = ractive.get('user.avatarIndex')
    if(blank(email) && avatarIndex == undefined) {
      details.avatarIndex = Avatar.randAvatarIndex()
    }

    db.set('userInfo', details, function(err, response){
      if(err) return handleUserError(response)

      Profile.hide($editEl, ractive, function(){
        Profile.show($previewEl, ractive)
      })
    })
  })

  function setAvatar(){
    var avatar = Avatar.getAvatar(ractive.get('user.email'),
                                  ractive.get('user.avatarIndex'))
    var avatarEl = ractive.nodes['details-preview'].querySelector('.settings__avatar')
    avatarEl.style.setProperty('background-image', "url('" + avatar + "')")
  }

  ractive.on('switch-token', function(event) {

    var token = event.node.id

    if(token === getNetwork()) return;

    var host = window.location.host
    var url = window.hasOwnProperty('cordova') ? 'index.html' : '/'

    if(token !== 'bitcoin') url += '?network=' + token

    window.location.assign(url);
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

  function blank(str) {
    return (str == undefined || str.trim() === '')
  }

  return ractive
}
