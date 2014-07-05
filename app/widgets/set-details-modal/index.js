'use strict';

var Ractive = require('hive-modal')
var db = require('hive-db')
var emitter = require('hive-emitter')
var showError = require('hive-flash-modal').showError

function fetchDetails(callback){
  db.get(function(err, doc){
    if(err) return callback(err);

    var name = doc.userInfo.firstName
    if(name && name !== '') {
      return callback()
    }

    openModal({
      name: name,
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

  ractive.on('submit-details', function(){
    var details = {
      firstName: ractive.get('name') + '',
      email: ractive.get('email')
    }

    if(!details.firstName || details.firstName.trim() === 'undefined') {
      return showError({message: "Without a name, the payer wouldn't be able to identify you on waggle."})
    }

    db.set('userInfo', details, function(err){
      if(err) return data.callback(err);

      ractive.fire('cancel', undefined)
      emitter.emit('details-updated', details)
      data.callback()
    })
  })

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

