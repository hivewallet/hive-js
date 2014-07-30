var fs = require('fs')
var path = require('path')
var sass = require('node-sass')
var autoprefixer = require('autoprefixer')
var watchify = require('watchify')
var browserify = require('browserify')

function styles(callback){
  sass.render({
    file: './app/application.scss',
    success: function(css){
      var prefixed = autoprefixer.process(css).css
      fs.writeFile('./build/assets/css/application.css', prefixed, callback)
    },
    error: callback
  })
}

function scripts(callback) {
  bundle('./app/application.js', './build/assets/js/application.js', callback)
}

function loader(callback) {
  bundle('./app/loader/nope.js', './build/assets/js/nope.js', callback)
  bundle('./app/loader/index.js', './build/assets/js/loader.js', callback)
}

function bundle(inFile, outFilename, callback){
  watchify.args.entries = path.join(__dirname, inFile)
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
  var dest = fs.createWriteStream(outFilename);
  bundler.bundle()
    .on('error', onError)
    .on('end', onEnd)
    .pipe(dest)

  function onError(err){
    console.error(inFile, "compilation failed")
    console.error(err.message);
    console.error(err.stack)

    if(callback) callback(err)
  }

  function onEnd(){
    console.log(inFile, "compiled")
    if(callback) callback()
  }
}

function isProduction(){
  return process.env.NODE_ENV === "production"
}

function done(filename, err){
  if(err) {
    console.error(filename, "compilation failed")
    console.error(err.message);
    console.error(err.stack)
    return
  }
  console.log(filename, "compiled")
}

styles(function(err){
  done('application.css')
})

scripts()
loader()
