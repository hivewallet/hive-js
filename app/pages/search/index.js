'use strict';

var Ractive = require('ractify')
var geo = require('hive-geo')
var emailToAvatar = require('hive-gravatar').emailToAvatar

module.exports = function(el){
  var nearbys = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      nearbys: nearbys,
      searching: false,
      emailToAvatar: emailToAvatar
    }
  })

  ractive.on('search-nearby', function(){
    ractive.set('searching', true)
    geo.search(function(err, results){
      if(err) return alert(err);

      ractive.set('searching', false)
      nearbys = results.map(function(record){
        return record[0]
      })
      ractive.set('nearbys', nearbys)
    })
  })

  return ractive
}

