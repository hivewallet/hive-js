if(window.hasOwnProperty('cordova')) {
  document.addEventListener('deviceready', function() {
    window.TF = new TestFlight();

    TF.setDeviceIdentifier(function() {
      TF.takeOff(function() {}, function() {}, '4d45d507-9d3a-459c-b243-e5ea2f25b7de')
    }, function() {}, window.device.uuid)
  }, false)
}