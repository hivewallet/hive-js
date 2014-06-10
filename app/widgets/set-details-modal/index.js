'use strict';

var Ractive = require('hive-modal')
var db = require('hive-db')

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
    el: document.getElementById('general-purpose-overlay'),
    partials: {
      content: require('./content.ract').template
    }
  })

  ractive.on('submit-details', function(){
    //TODO: validate name is not empty
    var details = {
      firstName: ractive.get('name'),
      email: ractive.get('email')
    }

    db.set('userInfo', details, function(err, resp){
      if(err) return data.callback(err);

      ractive.fire('cancel')
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

