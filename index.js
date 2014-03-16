'use strict';

var landing = require('./pages/landing')
var menu = require('./widgets/menu')
var sendDialog = require('./widgets/send-dialog')
var profile = require('./pages/profile')
var apps = require('./pages/apps')
var transactions = require('./pages/transactions')

landing(document.getElementById("landing"))
menu(document.getElementById("sidebar"))
profile(document.getElementById("profile"))
apps(document.getElementById("apps"))
transactions(document.getElementById("transactions"))
sendDialog(document.getElementById("send-dialog"))

