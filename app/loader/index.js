require('browsernizr/lib/load')
require('browsernizr/test/storage/localstorage')

var Modernizr = require('browsernizr')

Modernizr.load({
  test: Modernizr.localstorage,
  yep: 'assets/js/application.js',
  nope: 'assets/js/nope.js',
  callback: function(url, result, key){
    console.log(arguments)
  }
})

//monkey patch URL for safari 6
window.URL = window.URL || window.webkitURL

