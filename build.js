var fs = require('fs')
var path = require('path')
var sass = require('node-sass')
var autoprefixer = require('autoprefixer')
var watchify = require('watchify')
var browserify = require('browserify')
var cpr = require('cpr').cpr
var async = require('async')
var mkdirp = require('mkdirp')
var glob = require('glob')

function styles(callback){
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
  bundle('./app/application.js', './build/assets/js/application.js', callback)
}

function loader(callback) {
  async.parallel([
    function(cb) { bundle('./app/loader/nope.js', './build/assets/js/nope.js', cb) },
    function(cb) { bundle('./app/loader/index.js', './build/assets/js/loader.js', cb) }
  ], callback)
}

function html(callback) {
  copy('./app/index.html', './build/index.html', callback)
}

function assets(callback) {
  copy('./app/assets/', './build/assets/', callback)
}

function test(callback) {
  bundle(glob.sync("./app/@(widgets|lib)/*/test/*"), './build/assets/js/tests/index.js', callback)
}

function copy(from, to, callback){
  cpr(from, to, {
    deleteFirst: true,
    overwrite: true
  }, done(from, 'copy', callback))
}

function bundle(inFile, outFilename, callback){
  if(typeof inFile === 'string') inFile = [inFile]
  watchify.args.entries = inFile.map(function(file){
    return path.join(__dirname, file)
  })
  var bundler = browserify(watchify.args)

  // watch
  if(!isProduction()){
    bundler = watchify(bundler)
    bundler.on('update', function(ids){
      console.log(inFile, 'updated due to changes in', ids)
    })
  }

  // transforms
  bundler = bundler.transform('ractify')
  if(isProduction()) {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  // bundle
  prepareDir(outFilename, function(err){
    if(err) return cb(err);

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

    if(next) next(err)
  }
}

assets(function(err){
  if(err) return;

  html()
  styles()
  scripts()
  loader()

  test()
})
