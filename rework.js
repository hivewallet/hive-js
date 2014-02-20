const wrapSelectors = require('wrap-selectors')
const sheetify = require('sheetify')
const bundler = sheetify(process.cwd() + '/' + (process.argv[2]))

bundler.modifier(function(file, style, next) {
  wrapSelectors()(style)
  next()
})

bundler.bundle({debug: true}, function(err, css) {
  if (err) throw err
  console.log(css)
})
