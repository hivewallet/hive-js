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

function scripts() {
  bundle('./app/application.js', './build/assets/js/application.js')
}

function loader() {
  bundle('./app/loader/nope.js', './build/assets/js/nope.js')
  bundle('./app/loader/index.js', './build/assets/js/loader.js')
}

function html() {
  copy('./app/index.html', './build/index.html')
}

function copy(from, to){
  var callback = done(from, 'copy')

  var inStream = fs.createReadStream(from)
  inStream.on('error', callback)
  inStream.on('end', callback)

  var outStream = fs.createWriteStream(to)
  outStream.on('error', callback)

  inStream.pipe(outStream)
}

function bundle(inFile, outFilename){
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
    .on('error', done(inFile, 'compilation'))
    .on('end', done(inFile, 'compilation'))
    .pipe(dest)
}

function isProduction(){
  return process.env.NODE_ENV === "production"
}

function done(filename, action){
  return function(err) {
    if(err) {
      console.error(filename, action, "failed")
      console.error(err.message);
      console.error(err.stack)
      return
    }
    console.log(filename, action, "succeeded")
  }
}

styles(done('application.css', 'compilation'))

scripts()
loader()
html()
