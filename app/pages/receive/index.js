'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      address: '1Bgbigq3ivsCUgAG3s…'
    }
  });



  return ractive;
}
