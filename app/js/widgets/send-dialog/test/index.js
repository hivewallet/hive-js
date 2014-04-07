var $ = require('browserify-zepto');
var sendDialog = require('../index')

describe('send-dialog', function() {
  var triggerButton;

  beforeEach(function(){
    var el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
    sendDialog(el)
    triggerButton = $(document).find('.modal-open')
  })

  it('clicking on trigger button opens the modal', function() {
    expect($('.modal')).toBeFalsy
    triggerButton.click()
    expect($('.modal')).toBeTruthy
  });

  describe('dismiss modal', function(){
    beforeEach(function(){
      triggerButton.click()
    })

    it('clicking on cancel button', function() {
      $('button.modal-cancel').click()
      expect($('.modal')).toBeFalsy
    });

    it('clicking on the modal', function() {
      $('modal.modal-cancel').click()
      expect($('.modal')).toBeFalsy
    });
  })
});
