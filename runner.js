var fs = require('fs')
var cp = require('child_process')

var children = []

task = process.argv.reduce(function(memo, arg) {
  if(memo === false && arg.match(/runner.js/)) {
    return null
  }
  if(memo === null) {
    return arg
  }
  return memo
}, false) || 'default'

if(task === 'build') {
  fs.readdirSync('./app/lib/i18n/translations').map(function(f){
    return f.replace('.json', '')
  }).forEach(function(language) {
    var scripts = cp.fork('./build', {env: { LANGUAGE: language }})
    scripts.send(['scripts', 'loader'])
    children.push(scripts)
  })

  var others = cp.fork('./build')
  others.send(['html', 'styles', 'images'])
  children.push(others)
} else if (task === 'serve' || task === 'watch') {
  var child = cp.fork('./build')
  child.send(task)
} else {
  var child = cp.fork('./build')
  child.send(task)
  children.push(child)
}

children.forEach(function(c) {
  c.on('message', maybeDone)
})

var childCount = children.length
function maybeDone() {
  childCount--;
  if(childCount === 0) process.exit()
}
