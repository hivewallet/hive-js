'use strict';

var Ractive = require('hive-modal')
var emitter = require('hive-emitter')
var qrcode = require('hive-qrcode')
var getNetwork = require('hive-network')

module.exports = function showTooltip(data){

  var ractive = new Ractive({
    el: document.getElementById('tooltip'),
    partials: {
      content: require('./content.ract').template,
    },
    data: data
  })

  var canvas = ractive.nodes['qr-canvas']
  var qr = qrcode(getNetwork() + ':' + ractive.get('address'))
  canvas.appendChild(qr)

  ractive.on('close', function(){
    ractive.fire('cancel')
  })

  return ractive
}

