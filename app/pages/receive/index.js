'use strict';

var Ractive = require('hive-ractive')

module.exports = function(el){
  return new Ractive({
    el: el,
    template: require('./index.ract').template,
  });
}
