'use strict';
var translate = require('hive-i18n').translate

var message = translate("Sorry, Hive Wallet did not load.") +
  "<br/><br/>" +
  translate("Try updating your browser, or switching out of private browsing mode. If all else fails, download Chrome for your device.")

document.getElementById('loader-message').innerHTML = message
