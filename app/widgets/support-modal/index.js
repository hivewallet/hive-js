'use strict';

var Ractive = require('hive-modal')
var db = require('hive-db')
var showError = require('hive-flash-modal').showError
var xhr = require('hive-xhr')

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
    console.log(params)
    sendRequest(params)
  })

  function sendRequest(paramsObj){
    var params = Object.keys(paramsObj).map(function(key) {
      return key + '=' + paramsObj[key];
    }).join('&')
    var uri = "https://hivewallet.zendesk.com/requests/embedded/create/?" + params
    var corsUri = process.env.PROXY_URL + "?url=" + encodeURIComponent(uri)

    xhr({
      uri: corsUri
    }, function(err, resp, body){
      if(resp.statusCode !== 200) {
        console.error(body)
        return data.callback(err)
      }
      data.callback(null)
    })
  }

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

