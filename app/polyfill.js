//monkey patch Uint8ClampedArray for android API level 15 and below
var TA = require('typedarray')
window.Uint8ClampedArray = window.Uint8ClampedArray || TA.Uint8ClampedArray
window.Float64Array = window.Float64Array || TA.Float64Array

//monkey patch URL for safari 6
window.URL = window.URL || window.webkitURL
