'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')

var defaults = {
  error: {
    icon: 'error_temp',
    title: 'Whoops!'
  },
  info: {
    icon: 'info_temp',
    title: 'Just saying...'
  }
}

function getModal(type, data){
  data = data || {}
  data.icon = data.icon || defaults[type].icon
  data.title = data.title || defaults[type].title
  data.type = type

  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template,
    },
    data: data
  })

  return ractive
}

function showError(data) {
  return getModal('error', data)
}

function showInfo(data) {
  return getModal('info', data)
}

module.exports = {
  showError: showError,
  showInfo: showInfo
}
