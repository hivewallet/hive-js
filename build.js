var fs = require('fs')
var sass = require('node-sass')
var autoprefixer = require('autoprefixer')
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
  var bundler = browserify('./app/application.js')
  bundle(bundler, './build/assets/js/application.js', callback)
}

function bundle(bundler, outFilename, callback){
  bundler = bundler.transform('ractify')
  if(process.env.NODE_ENV === "production") {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  var dest = fs.createWriteStream(outFilename);
  bundler.bundle()
    .on('error', callback)
    .on('end', callback)
    .pipe(dest)
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
