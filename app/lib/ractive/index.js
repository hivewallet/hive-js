'use strict';
var Ractive = require('ractive/build/ractive.runtime')

// extracted from https://github.com/RactiveJS/Ractive-events-keys
var makeKeyDefinition = function ( code ) {
  return function ( node, fire ) {
    var keydownHandler;

    node.addEventListener( 'keydown', keydownHandler = function ( event ) {
      var which = event.which || event.keyCode;

      if ( which === code ) {
        event.preventDefault();

        fire({
          node: node,
          original: event
        });
      }
    }, false );

    return {
      teardown: function () {
        node.removeEventListener( 'keydown', keydownHandler, false );
      }
    };
  };
};

var events = Ractive.events

events.enter = makeKeyDefinition(13);
events.tab = makeKeyDefinition(9);
events.escape = makeKeyDefinition(27);
events.space = makeKeyDefinition(32);

events.leftarrow = makeKeyDefinition(37);
events.rightarrow = makeKeyDefinition(39);
events.downarrow = makeKeyDefinition(40);
events.uparrow = makeKeyDefinition(38);

Ractive.prototype.hide = function(){
  this.fire('before-hide')
  this.el.classList.remove('current')
}

Ractive.prototype.show = function(){
  this.fire('before-show')
  this.el.classList.add('current')
}

module.exports = Ractive
