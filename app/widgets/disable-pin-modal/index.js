'use strict';

var Ractive = require('hive-modal')
var showError = require('hive-flash-modal').showError
var showInfo = require('hive-flash-modal').showInfo
var disablePin = require('hive-wallet').disablePin

function openModal(){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
    }
  })

  ractive.on('disable-pin', function(){
    disablePin(ractive.get('pin'), function(err){
      if(err) {
        var message = 'Failed to disable pin. Please make sure you enter the correct pin'
        return showError({ message: message })
      }

      showInfo({
        message: 'Pin disabled. About to reload wallet.',
        onDismiss: function(){
          window.location.reload()
        }
      })
    })
  })

  return ractive
}

module.exports = openModal
