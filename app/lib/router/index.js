var hasher = require('hasher')
var router = require('crossroads')

function parseHash(newHash, oldHash){
  router.parse(newHash);
}

hasher.initialized.add(parseHash)
hasher.changed.add(parseHash)
hasher.init()

var re = /^#\//,
    str = window.location.hash,
    newstr = str.replace(re, '');

hasher.setHash(newstr);

module.exports = {
  router: router,
  hasher: hasher
}
