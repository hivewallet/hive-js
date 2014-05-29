'use strict'

module.exports = {
  fade: function(t, params) {
    var targetStyle, props, collapsed, defaults;

    defaults = {
      duration: 200,
      easing: 'linear'
    };

    props = [
      'opacity'
    ];

    collapsed = {
      opacity: '0'
    };

    params = t.processParams(params, defaults)

    if (t.isIntro) {
      targetStyle = t.getStyle(props)
      t.setStyle(collapsed)
    } else {
      // make style explicit, so we're not transitioning to 'auto'
      t.setStyle(t.getStyle(props))
      targetStyle = collapsed
    }

    t.animateStyle(targetStyle, params).then(t.complete)
  },
  dropdown: function(t, params) {
    var targetStyle, props, collapsed, defaults;

    defaults = {
      duration: 200,
      easing: 'ease',
      delay: 800
    };

    props = [
      'transform'
    ];

    collapsed = {
      transform: 'translateY(-100%)'
    };

    params = t.processParams(params, defaults)

    if (t.isIntro) {
      targetStyle = t.getStyle(props)
      t.setStyle(collapsed)
    } else {
      // make style explicit, so we're not transitioning to 'auto'
      t.setStyle(t.getStyle(props))
      targetStyle = collapsed
    }

    t.animateStyle(targetStyle, params).then(t.complete)
  },
  pulse: function(t, params) {
    var targetStyle, props, collapsed, defaults;

    defaults = {
      duration: 900,
      easing: 'ease'
    };

    props = [
      'transform',
      'opacity'
    ];

    collapsed = {
      transform: 'scale(0.2)',
      opacity: 0
    };

    params = t.processParams(params, defaults)

    if (t.isIntro) {
      targetStyle = t.getStyle(props)
      t.setStyle(collapsed)
    } else {

      props = [
        'transform',
        'opacity'
      ];

      collapsed = {
        transform: 'scale(1.4)',
        opacity: 0
      };
      // make style explicit, so we're not transitioning to 'auto'
      t.setStyle(t.getStyle(props))
      targetStyle = collapsed
    }

    t.animateStyle(targetStyle, params).then(t.complete)
  }
}

