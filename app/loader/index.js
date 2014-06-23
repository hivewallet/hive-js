require('browsernizr/lib/load')
require('browsernizr/test/storage/localstorage')
require('browsernizr/test/workers/webworkers')
require('browsernizr/test/blob')

var animateLogo = require('hive-transitions/loader.js').in
var fadeOut = require('hive-transitions/loader.js').out
var Modernizr = require('browsernizr')

var elems =  {
  block1: document.getElementById('logo_block1'),
  block2: document.getElementById('logo_block2'),
  block3: document.getElementById('logo_block3'),
  block4: document.getElementById('logo_block4'),
  block5: document.getElementById('logo_block5'),
}

var containerEl = document.getElementById('loader')
var keyEl = document.getElementById('logo_key')


animateLogo(elems)

Modernizr.load({
  test: (Modernizr.localstorage && Modernizr.webworkers && Modernizr.blobconstructor),
  yep: 'assets/js/application.js',
  nope: 'assets/js/nope.js',
  complete: function() {
    setTimeout(function(){
      fadeOut(containerEl, keyEl)
    }, 1000)
  }
})

//monkey patch URL for safari 6
window.URL = window.URL || window.webkitURL

