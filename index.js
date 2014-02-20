'use strict';

var profile = require('./pages/profile')
profile(document.getElementById("profile"))

var apps = require('./pages/apps')
apps(document.getElementById("apps"))

// menu
var $ = require('browserify-zepto');
$(".tab").on('click', function(){
  $('.tab').removeClass('active')
  $(this).closest('.tab').addClass('active')
})
