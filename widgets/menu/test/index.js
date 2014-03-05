var $ = require('browserify-zepto');
var menu = require('../index')

describe('menu', function() {
  var tabs;

  beforeEach(function(){
    var el = document.createElement('div')
    document.body.appendChild(el)
    menu(el)
    tabs = $(document).find('.tab')
  })

  it('has nothing highlighted initially', function() {
    tabs.each(function(i, el){
      expect($(el).hasClass('active')).toBeFalsy()
    })
  });

  it('highlights when clicked', function() {
    tabs.last().click()
    expect(tabs.last().hasClass('active')).toBeTruthy()
  });
});
