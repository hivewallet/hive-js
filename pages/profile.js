var Ractive = require('ractify')

var ractive = new Ractive({
  el: document.getElementById("profile"),
  template: require('./profile.ract'),
  data: {
    user: {
      name: 'Wei Lu',
      address: '1Bu3bhwRmevHLAy1JrRB6AfcxfgDG2vXRd',
      email: 'wei@hivewallet.com',
      picture: 'https://pbs.twimg.com/media/BdrFa5WCUAAXFpZ.jpg'
    },
    btcBalance: 0.6,
    fiatBalance: 36
  }
});

