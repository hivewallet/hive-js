'use strict';

var Velocity = require('./index.js')
var fadeOut = require('./fade.js').fadeOut

function animateIn(el, delay) {
  // reset at the start
  Velocity.animate(el, {
    opacity: 0,
    translateY: '-5px'
  }, {
    duration: 0,
    complete: function() {
      Velocity.animate(el, {
        opacity: 1,
        translateY: 0
      }, {
        easing: "ease",
        duration: 400,
        delay: delay
      })
    }
  })
}

module.exports =  {
  in: function(elems) {
    animateIn(elems['block1'], 300)
    animateIn(elems['block2'], 500)
    animateIn(elems['block3'], 700)
    animateIn(elems['block4'], 900)
    animateIn(elems['block5'], 1100)
  },
  out: function(container, key) {
    Velocity.animate(key, {
      rotateZ: '30deg',
    }, {
      easing: "linear",
      duration: 100,
      complete: function() {
        setTimeout(function(){
          fadeOut(container, function() {
            window.initHiveApp()
          })
        },200)
      }
    })
  }
}
