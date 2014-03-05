'use strict';

var landing = require('./pages/landing')
var menu = require('./widgets/menu')
var profile = require('./pages/profile')
var apps = require('./pages/apps')

landing(document.getElementById("landing"))
menu(document.getElementById("sidebar"))
profile(document.getElementById("profile"))
apps(document.getElementById("apps"))

