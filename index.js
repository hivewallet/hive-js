'use strict';

var landing = require('./pages/landing')
var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var profile = require('./pages/profile')
var apps = require('./pages/apps')

landing(document.getElementById("landing"))
menu(document.getElementById("sidebar"))
profile(document.getElementById("profile"))
apps(document.getElementById("apps"))
sendDialog(document.getElementById("send-dialog"))

