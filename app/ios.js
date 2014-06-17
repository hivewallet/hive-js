if(window.hasOwnProperty('cordova')) {
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide()
  }, false)
}