'use strict';

var Ractive = require('hive-ractive')
var sendDialog = require('hive-send-dialog')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template
  })

  sendDialog(ractive.find("#send-dialog"))

  return ractive
}
