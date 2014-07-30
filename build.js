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

function bundle(inFile, outFilename, callback){
  watchify.args.entries = path.join(__dirname, inFile)
  var bundler = browserify(watchify.args)

  if(!isProduction()){
    bundler = watchify(bundler)
    bundler.on('update', function(ids){
      console.log(outFilename, 'updated due to changes in', ids)
    })
  }

  bundler = bundler.transform('ractify')
  if(isProduction()) {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  var dest = fs.createWriteStream(outFilename);
  bundler.bundle()
    .on('error', callback)
    .on('end', callback)
    .pipe(dest)
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
  console.log(filename, "was reloaded")
}

styles(function(err){
  done('application.css')
})

scripts(function(err){
  done('application.js')
})
