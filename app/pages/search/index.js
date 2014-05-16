'use strict';

var Ractive = require('hive-ractive')
var geo = require('hive-geo')
var emailToAvatar = require('hive-gravatar').emailToAvatar
var emitter = require('hive-emitter')

module.exports = function(el){
  var nearbys = []
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract').template,
    data: {
      nearbys: nearbys,
      searching: false,
      search_msg: 'Search Nearby',
      emailToAvatar: emailToAvatar
    }
  })

  ractive.on('search-nearby', function(){
    ractive.set('searching', true);
    geo.search(function(err, results){
      if(err) return alert(err);

      ractive.set('searching', false);
      ractive.set('search_msg', 'Search Again');
      nearbys = results.map(function(record){
        return record[0]
      })
      ractive.set('nearbys', nearbys)
    })
  })

  ractive.on('select', function(event){
    event.original.preventDefault();
    
    var data = {
      to: '1J3jePABR9RjyLmbU4pnBrPatctoneid3H',
      amount: '',
      contact: {
        name: '',
        avatar: ''
      },
      someValue: true
    }

    emitter.emit('open-send-dialog', data);
  })

  ractive.on('before-hide', function(){
    geo.remove()
  })

  window.onbeforeunload = function() {
    geo.remove()
  }

  return ractive
}

