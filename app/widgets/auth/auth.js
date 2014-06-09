'use strict';

var Ractive = require('hive-ractive')
var Hive = require('hive-wallet')
var emitter = require('hive-emitter')

var Auth = Ractive.extend({
  el: document.getElementById("auth"),
  template: require('./index.ract').template,
  partials: {
    header: require('./choose/header.ract').template,
    footer: require('./footer.ract').template
  },
  init: function(){
    var timerId = null
    var self = this
    this.set('opening', false)

    emitter.on('wallet-opening', function(progress){
      self.set('progress', progress)
      loading()
    })

    function onSyncDone(err, transactions) {
      self.set('opening', false)
      if(err) {
        if(err === 'user_deleted') return location.reload(false);
        emitter.emit('open-error', { message: err })
        return;
      }

      emitter.emit('wallet-ready')
      emitter.emit('transactions-loaded', transactions)
    }

    function getNetwork() {
      if(location.search.indexOf('network=testnet') > 0) {
        return 'testnet'
      }
    }

    function loading() {
      timerId = setInterval(function(){
        var text = self.get('progress')
        self.set('progress', text + '.')
      }, 500)
    }

    function pauseLoading() {
      clearInterval(timerId)
      timerId = null
    }

    this.onSyncDone = onSyncDone
    this.getNetwork = getNetwork
    this.loading = loading
    this.pauseLoading = pauseLoading
  }
})

module.exports = Auth
