'use strict';

var Ractive = require('ractify')
var geo = require('hive-geo')

module.exports = function(el){
  var nearbys = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      nearbys: nearbys,
      searching: false
    }
  })

  ractive.on('search-nearby', function(){
    ractive.set('searching', true)
    geo.search(function(err, results){
      if(err) return alert(err);

      ractive.set('searching', false)
      ractive.update('nearbys')
      console.log(nearbys)
    })
  })

  return ractive
}

