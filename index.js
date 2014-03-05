'use strict';

var menu = require('./widgets/menu')
menu(document.getElementById("sidebar"))

var profile = require('./pages/profile')
profile(document.getElementById("profile"))

var apps = require('./pages/apps')
apps(document.getElementById("apps"))

