'use strict';

var Ractive = require('hive-ractive')
var Dropdown = require('hive-transitions/dropdown.js')
var initAccount = require('hive-dropdown-account')
var initToken = require('hive-dropdown-token')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {}
  })

  initAccount(ractive.nodes.account_settings)
  initToken(ractive.nodes.token_settings)

  return ractive
}
