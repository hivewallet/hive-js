cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
        "id": "org.apache.cordova.statusbar.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/com.phonegap.plugins.barcodescanner/www/barcodescanner.js",
        "id": "com.phonegap.plugins.barcodescanner.BarcodeScanner",
        "clobbers": [
            "cordova.plugins.barcodeScanner"
        ]
    },
    {
        "file": "plugins/com.testflightapp.cordova-plugin/www/testflight.js",
        "id": "com.testflightapp.cordova-plugin.TestFlight",
        "clobbers": [
            "TestFlight"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.statusbar": "0.1.3",
    "com.phonegap.plugins.barcodescanner": "1.0.1",
    "com.testflightapp.cordova-plugin": "3.1.0",
    "org.apache.cordova.device": "0.2.10"
}
// BOTTOM OF METADATA
});