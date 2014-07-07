'use strict';

var Ractive = require('hive-ractive')
var animateDropdown = require('hive-transitions/dropdown.js')

var Dropdown = Ractive.extend({
  template: require('./index.ract').template,
  partials: {
    content: require('./content.ract').template,
    icon: require('./icon.ract').template
  },
  data: {
    dropdown_open: true,
    animating: false
  },
  init: function(){

    var self = this

    self.on('toggle', function(){

      if(self.get('animating')) return;

      var arrow = self.nodes.arrow
      var elem = self.nodes.content

      if(self.get('dropdown_open')) {
        self.set('dropdown_open', false)
        animateDropdown.hide(elem, arrow, self)
      } else {
        self.set('dropdown_open', true)
        animateDropdown.show(elem, arrow, self)
      }
    })
  }
})

module.exports = Dropdown

