require('browsernizr/lib/load')
require('browsernizr/test/storage/localstorage')
require('browsernizr/test/workers/webworkers')
require('browsernizr/test/blob')

var Modernizr = require('browsernizr')

Modernizr.load({
  test: (Modernizr.localstorage && Modernizr.webworkers && Modernizr.blobconstructor),
  yep: 'assets/js/application.js',
  nope: 'assets/js/nope.js'
})

//monkey patch URL for safari 6
window.URL = window.URL || window.webkitURL

