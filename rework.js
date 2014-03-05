var wrapSelectors = require('wrap-selectors')
var rework = require('rework')
var fs = require('fs')
var bl = require('bl')

process.stdin.pipe(bl(function(err, css) {
  console.log(
    rework(css.toString())
    .use(wrapSelectors())
    .toString()
  )
}))
