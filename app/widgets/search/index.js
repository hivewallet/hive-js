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
    if(ractive.get('searching')) { return; }
    ractive.set('searching', true);    
    ractive.set('search_msg', 'Searching...');
    geo.search(function(err, results){
      if(err) return emitter.emit('open-error', err)

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

    var named_heading = ' to: ' + event.node.getAttribute( 'data-name' );

    var data = {
      to: event.node.getAttribute( 'data-wallet' ),
      amount: '',
      contact: {
        name: event.node.getAttribute( 'data-name' ),
        avatar: event.node.getAttribute( 'data-email' )
      },
      heading: named_heading,
      hide_address: true
    }

    emitter.emit('open-send-dialog', data);
  })

  ractive.on('before-hide', function(){
    geo.remove()
  })

  window.onbeforeunload = function() {
    geo.remove(true)
  }

  return ractive
}

