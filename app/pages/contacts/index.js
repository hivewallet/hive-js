'use strict';

var Ractive = require('ractive/build/ractive.runtime')

module.exports = function(el){
  return new Ractive({
    el: el,
    template: require('./index.ract').template,
  });
}
