'use strict';

var Ractive = require('hive-modal')
var db = require('hive-db')
var showError = require('hive-flash-modal').showError
var sendRequest = require('hive-zendesk')

function fetchDetails(callback){
  db.get(function(err, doc){
    if(err) return callback(err);

    openModal({
      name: doc.userInfo.firstName,
      email: doc.userInfo.email,
      callback: callback
    })
  })
}

function openModal(data){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template
    }
  })

  var params = {}
  ractive.on('submit-details', function(){
    ['name', 'email', 'description'].forEach(function(field){
      if(isBlankField(field)) {
        return showError({message: field + " can't be blank"})
      }

      params[field] = ractive.get(field)
    })

    params['subject'] = 'This is a support request from Hive web'
    sendRequest(params, data.callback)
  })

  function isBlankField(field){
    var value = ractive.get(field)
    return (!value || value.toString().trim() === '')
  }

  function center(){
    var modal = ractive.find('.flash')
    var background = ractive.find('.overlay--flash')
    var top = (background.clientHeight - modal.clientHeight) / 2
    modal.style.top = top + 'px'
  }

  center()
  return ractive
}

module.exports = fetchDetails

