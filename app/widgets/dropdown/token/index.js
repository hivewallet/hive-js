'use strict';

var Ractive = require('hive-dropdown')

module.exports = function init(el) {

  var ractive = new Ractive({
    el: el,
    partials: {
      content: require('./content.ract').template,
      icon: require('./icon.ract').template
    },
    data: {
      title: 'Available Tokens'
    }
  })

  return ractive
}
