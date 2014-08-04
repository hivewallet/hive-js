var copy = require('./util').copy

function html(callback) {
  copy('./app/index.html', './build/', callback)
}

module.exports = html
