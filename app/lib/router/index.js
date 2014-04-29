var hasher = require('hasher')
var router = require('crossroads')

function parseHash(newHash, oldHash){
  router.parse(newHash);
}
hasher.prependHash = '!'
hasher.initialized.add(parseHash)
hasher.changed.add(parseHash)
hasher.init()

module.exports = {
  router: router,
  hasher: hasher
}
