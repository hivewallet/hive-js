require('browsernizr/lib/load')
require('browsernizr/test/storage/localstorage')
require('browsernizr/test/storage/websqldatabase')
require('browsernizr/test/indexedDB')
require('browsernizr/test/workers/webworkers')
require('browsernizr/test/blob')
require('browsernizr/test/crypto/getrandomvalues')

var token = require('hive-network')()
var animateLogo = require('hive-transitions/loader.js').in
var fadeOut = require('hive-transitions/loader.js').out
var Modernizr = require('browsernizr')

document.getElementsByTagName('html')[0].classList.add(token)

var elems =  {
  block1: document.getElementById('logo_block1'),
  block2: document.getElementById('logo_block2'),
  block3: document.getElementById('logo_block3'),
  block4: document.getElementById('logo_block4'),
  block5: document.getElementById('logo_block5'),
}

var containerEl = document.getElementById('loader')
var keyEl = document.getElementById('logo_key')
var goodToGo;

animateLogo(elems)

Modernizr.on('indexeddb', function(hasIndexedDB){
  var supportsPouchDB = hasIndexedDB || Modernizr.websqldatabase

  Modernizr.load({
    test: supportsPouchDB && (Modernizr.localstorage && Modernizr.webworkers && Modernizr.blobconstructor && Modernizr.getrandomvalues),
    yep: 'assets/js/application.js',
    nope: 'assets/js/nope.js',
    callback: function(testResult, key) {
      goodToGo = key
    },
    complete: function() {
      if(goodToGo) {
        setTimeout(function(){
          fadeOut(containerEl, keyEl)
        }, 1000)
      }
    }
  })
})


//monkey patch URL for safari 6
window.URL = window.URL || window.webkitURL

