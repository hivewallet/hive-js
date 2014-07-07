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

var partials = Ractive.partials

partials.svg_arrow = require('hive-svg/arrow.ract').template
partials.svg_cancel = require('hive-svg/cancel.ract').template
partials.svg_caret = require('hive-svg/caret.ract').template
partials.svg_close = require('hive-svg/close.ract').template
partials.svg_exit = require('hive-svg/exit.ract').template
partials.svg_help = require('hive-svg/help.ract').template
partials.svg_hex_large = require('hive-svg/hex_large.ract').template
partials.svg_history = require('hive-svg/history.ract').template
partials.svg_lock = require('hive-svg/lock.ract').template
partials.svg_logo_key = require('hive-svg/logo_key.ract').template
partials.svg_logo_stack = require('hive-svg/logo_stack.ract').template
partials.svg_logo = require('hive-svg/logo.ract').template
partials.svg_qr = require('hive-svg/qr.ract').template
partials.svg_expand = require('hive-svg/expand.ract').template
partials.svg_email = require('hive-svg/email.ract').template
partials.svg_receive = require('hive-svg/receive.ract').template
partials.svg_refresh = require('hive-svg/refresh.ract').template
partials.svg_send = require('hive-svg/send.ract').template
partials.svg_sendto = require('hive-svg/sendto.ract').template
partials.svg_settings = require('hive-svg/settings.ract').template
partials.svg_success = require('hive-svg/success.ract').template
partials.svg_token_bitcoin = require('hive-svg/token_bitcoin.ract').template
partials.svg_token_litecoin = require('hive-svg/token_litecoin.ract').template
partials.svg_token = require('hive-svg/token.ract').template
partials.svg_user = require('hive-svg/user.ract').template
partials.svg_waggle = require('hive-svg/waggle.ract').template
partials.svg_warning = require('hive-svg/warning.ract').template

Ractive.prototype.hide = function(){
  this.fire('before-hide')
  this.el.classList.remove('current')
}

Ractive.prototype.show = function(){
  this.fire('before-show')
  this.el.classList.add('current')
}

module.exports = Ractive
