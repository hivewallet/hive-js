var Watcher = require('gaze').Gaze
var request = require('request')
var minimatch = require('minimatch')
var styles = require('./styles')
var loader = require('./loader')
var test = require('./test')
var scripts = require('./scripts')
var images = require('./images')
var html = require('./html')
var livereloadport = require('./serve').livereloadport

function watch(callback) {
  var watcher = new Watcher(['app/**/*', '!app/**/node_modules/**/*', 'build/**/*.*', '!**/*~'])
  watcher.on('all', function(type, file){
    var cwd = process.cwd()
    if(minimatch(file, cwd + '/app/**/*.scss')){
      styles()
    } else if(minimatch(file, cwd + '/app/loader/**/*.js')){
      loader()
      test()
    } else if(minimatch(file, cwd + '/app/**/*.@(js|json|ract)')){
      scripts()
      test()
    } else if(minimatch(file, cwd + '/app/assets/img/*')){
      images()
    } else if(minimatch(file, cwd + '/app/index.html')){
      html()
    } else if(minimatch(file, cwd + '/build/**/*.*')){
      refresh(file.replace(cwd + '/build', ''))
    }
  })
}

function refresh(filename) {
  request('http://localhost:' + livereloadport + "/changed?files=" + filename, function(){
    console.log("notified client to reload", filename)
  })
}

module.exports = watch
