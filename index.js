'use strict';

var profile = require('./pages/profile')
profile(document.getElementById("profile"))

// menu
var $ = require('browserify-zepto');
$(".tab").on('click', function(){
  $('.tab').removeClass('active')
  $(this).closest('.tab').addClass('active')
})
