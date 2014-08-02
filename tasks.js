var fs = require('fs')
var path = require('path')
var sass = require('node-sass')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var cpr = require('cpr')
var async = require('async')
var mkdirp = require('mkdirp')
var glob = require('glob')
var exec = require('child_process').exec
var lrserver = require('tiny-lr')()
var buildServer = require('./server/express')
var Watcher = require('gaze').Gaze
var request = require('request')
var minimatch = require('minimatch')

var livereloadport = 35729

process.env.LANGUAGE = process.env.LANGUAGE || 'en'
var language = process.env.LANGUAGE

function serve(callback) {
  var serverport = 8080
  var server = buildServer()
  server.listen(serverport)
  lrserver.listen(livereloadport)

  done('server', 'start', callback)()
}

function styles(callback) {
  var inFile = './app/application.scss'
  var outFile = './build/assets/css/application.css'
  var cb = done(inFile, 'compilation', callback)

  prepareDir(outFile, function(err){
    if(err) return cb(err);

    sass.render({
      file: inFile,
      success: function(css){
        var prefixed = autoprefixer.process(css).css
        fs.writeFile(outFile, prefixed, cb)
      },
      error: cb
    })
  })
}

function scripts(callback) {
  bundle('./app/application.js', './build/assets/js/application-' + language + '.js', callback)
}

function loader(callback) {
  async.parallel([
    function(cb) { bundle('./app/loader/nope.js', './build/assets/js/nope-' + language + '.js', cb) },
    function(cb) { bundle('./app/loader/index.js', './build/assets/js/loader.js', cb) }
  ], callback)
}

function html(callback) {
  copy('./app/index.html', './build/', callback)
}

function images(callback) {
  copy('./app/assets/img', './build/assets/img', callback)
}

function test(callback) {
  bundle(glob.sync("./app/@(widgets|lib)/*/test/*"), './build/assets/js/tests/index.js', callback)
}

function sketch(callback) {
  var inFile = './app/assets-master.sketch'
  var outFolder = './app/assets/img/'
  var cb = done(outFolder, 'scketch export', callback)

  exec("sketchtool export artboards " + inFile + " --output=" + outFolder, cb)
}

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

function copy(from, to, callback){
  cpr(from, to, {
    deleteFirst: true,
    overwrite: true
  }, done(from, 'copy', callback))
}

function bundle(inFile, outFilename, callback){
  var bundler = browserify(inFile)

  // transforms
  bundler = bundler.transform('ractify')
  if(isProduction()) {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  // bundle
  prepareDir(outFilename, function(err){
    if(err) return cb(err);

    if(fs.existsSync(outFilename)) {
      fs.unlinkSync(outFilename)
    }

    var dest = fs.createWriteStream(outFilename);
    bundler.bundle()
      .on('error', done(outFilename, 'compilation', callback))
      .on('end', done(outFilename, 'compilation', callback))
      .pipe(dest)
  })
}

function isProduction(){
  return process.env.NODE_ENV === "production"
}

function prepareDir(filename, callback){
  mkdirp(path.dirname(filename), callback)
}

function done(filename, action, next){
  return function(err) {
    if(err) {
      console.error(filename, action, "failed")
      console.error(err);
      console.error(err.message);
      console.error(err.stack)
    } else {
      console.log(filename, action, "succeeded")
    }

    if(typeof next === 'function') next(err)
  }
}

var tasks = {
  serve: serve,
  images: images,
  html: html,
  styles: styles,
  scripts: scripts,
  loader: loader,
  test: test,
  sketch: sketch,
  watch: watch,
  default: function(){
    async.parallel([ scripts, loader, html, styles, images ], function(){
      serve()
      watch()
      test()
    })
  },
}

module.exports = tasks

process.on('message', function(task){
  if(typeof task === 'string') task = [task]
  task = task.map(function(t){
    return tasks[t]
  })

  async.parallel(task, function(err){
    process.send('done', err)
  })
})
