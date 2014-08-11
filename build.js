var fs = require('fs')
var cp = require('child_process')

var children = []

task = process.argv.reduce(function(memo, arg) {
  if(memo === false && arg.match(/build/)) {
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
    process.env.LANGUAGE = language
    var scripts = cp.fork('./tasks', {env: process.env})
    children.push([scripts, ['scripts', 'loaderNope']])
  })
  delete process.env.LANGUAGE

  var others = cp.fork('./tasks')
  children.push([others, ['html', 'styles', 'images', 'loaderIndex']])
} else if (task === 'serve' || task === 'watch') {
  var child = cp.fork('./tasks')
  child.send(task)
} else {
  var child = cp.fork('./tasks')
  children.push([child, task])
}

children.forEach(function(pair) {
  var child = pair[0]
  child.on('message', maybeDone)
})

var childCount = children.length
function maybeDone() {
  childCount--

  if(children.length > 0) {
    var next = children.splice(0, 1)[0]
    next[0].send(next[1])
  } else if(childCount === 0){
    process.exit()
  }
}

// 4 child processes at a time
children.splice(0, 4).forEach(function(pair){
  pair[0].send(pair[1])
})

