'use strict';

var Ractive = require('hive-ractive')
var Profile = require('hive-transitions/profileAnimation.js')
var showTooltip = require('hive-modal-tooltip')
var showError = require('hive-modal-flash').showError
var emitter = require('hive-emitter')
var Avatar = require('hive-avatar')
var db = require('hive-db')

module.exports = function init(el) {

  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      start_open: true,
      user: {
        firstName: '',
        email: ''
      },
      editingName: false,
      editingEmail: false,
      animating: false,
    }
  })

  var $previewEl = ractive.nodes['details-preview']
  var $editEl = ractive.nodes['details-edit']

  emitter.once('db-ready', function(){
    db.get(function(err, doc){
      if(err) return console.error(err);

      ractive.set('user', doc.userInfo)
      setAvatar()

      if(ractive.get('user.firstName')) {
        Profile.hide($editEl, ractive)
      } else {
        Profile.hide($previewEl, ractive)
      }
    })
  })

  ractive.on('edit-details', function(){
    if(ractive.get('animating')) return;
    Profile.hide($previewEl, ractive, function(){
      Profile.show($editEl, ractive)
    })
  })

  emitter.on('details-updated', function(details){
    ractive.set('user.firstName', details.firstName)
    Profile.hide($editEl, ractive, function(){
      Profile.show($previewEl, ractive)
    })
  })

  ractive.on('help', function() {
    showTooltip({
      message: 'Gravatar (globally recognised avatar) is a service that lets you re-use the same avatar across websites and apps by specifying an email address.',
      link: {
        text: 'Create a gravatar',
        url: 'https://gravatar.com/'
      }
    })
  })

  ractive.on('submit-details', function(){
    if(ractive.get('animating')) return;

    var details = ractive.get('user')

    if(blank(details.firstName)) {
      return showError({message: "A name is required to set your profile on Hive"})
    }

    if(blank(details.email) && details.avatarIndex == undefined) {
      details.avatarIndex = Avatar.randAvatarIndex()
    }

    db.set('userInfo', details, function(err, response){
      if(err) return handleUserError()

      ractive.set('user', details)
      setAvatar()

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

  function handleUserError() {
    var data = {
      title: "Uh Oh...",
      message: "Could not save your details"
    }
    showError(data)
  }

  function blank(str) {
    return (str == undefined || str.trim() === '')
  }

  return ractive
}
