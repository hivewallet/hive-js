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

function openModal(type, data){
  data = data || {}
  data.icon = data.icon || defaults[type].icon
  data.title = data.title || defaults[type].title
  data.type = type

  var ractive = new Ractive({
    el: document.getElementById('flash-modal'),
    partials: {
      content: require('./content.ract').template,
    },
    data: data
  })

  return ractive
}

function showError(data) {
  return openModal('error', data)
}

function showInfo(data) {
  return openModal('info', data)
}

module.exports = {
  showError: showError,
  showInfo: showInfo
}
