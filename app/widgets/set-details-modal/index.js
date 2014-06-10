'use strict';

var Ractive = require('hive-modal')
var showError = require('hive-flash-modal').showError
var showInfo = require('hive-flash-modal').showInfo
var disablePin = require('hive-wallet').disablePin
var db = require('hive-db')

function openModal(data){
  data = data || {}
  var callback = data.onComplete

  var ractive = new Ractive({
    el: document.getElementById('general-purpose-overlay'),
    partials: {
      content: require('./content.ract').template
    }
  })

  ractive.on('submit-details', function(){
    var details = {
      firstName: ractive.get('name'),
      email: ractive.get('email')
    }

    db.set('userInfo', details, function(err, resp){
      if(err) return callback(err);

      ractive.fire('cancel')
      callback()
    })
  })

  function center(){
    var modal = ractive.find('.flash')
    var background = ractive.find('.overlay--flash')
    var top = (background.clientHeight - modal.clientHeight) / 2
    modal.style.top = top + 'px'
  }

  function fetchDetails(){
    db.get(function(err, doc){
      if(err) return callback(err);

      ractive.set('name', doc.userInfo.firstName)
      ractive.set('email', doc.userInfo.email)
    })
  }

  fetchDetails()
  center()
  return ractive
}

module.exports = openModal

