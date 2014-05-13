'use strict';

var Ractive = require('ractify')

module.exports = function(el){
  return new Ractive({
    el: el,
    template: require('./index.ract'),
  });
}
