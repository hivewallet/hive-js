'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')

module.exports = function showTooltip(data){

  var ractive = new Ractive({
    el: document.getElementById('tooltip'),
    partials: {
      content: require('./content.ract').template,
    },
    data: data
  })

  ractive.on('close', function(){
    ractive.fire('cancel')
  })

  return ractive
}

