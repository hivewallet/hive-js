'use strict';

var Ractive = require('hive-ractive')
var emitter = require('hive-emitter')
var showError = require('hive-flash-modal').showError
var getNetwork = require('hive-network')

var Auth = Ractive.extend({
  el: document.getElementById("auth"),
  template: require('./index.ract').template,
  partials: {
    header: require('./choose/header.ract').template,
    footer: require('./choose/footer.ract').template
  },
  init: function(){
    var self = this
    this.set('opening', false)

    emitter.on('wallet-opening', function(progress){
      self.set('progress', progress)
    })

    self.on('teardown', function(){
      emitter.removeAllListeners('wallet-opening')
    })

    function onSyncDone(err, transactions) {
      self.set('opening', false)
      if(err) {
        if(err === 'user_deleted') return location.reload(false);
        emitter.emit('clear-pin')
        return showError({ message: 'Your PIN is incorrect' })
      }

      window.scrollTo( 0, 0 )
      emitter.emit('wallet-ready')
      emitter.emit('transactions-loaded', transactions)
    }

    this.onSyncDone = onSyncDone
    this.getNetwork = getNetwork
  }
})

module.exports = Auth
