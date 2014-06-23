var gulp = require('gulp')
var gutil = require('gulp-util')
var sass = require('gulp-sass')
var prefix = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var glob = require('glob')
var refresh = require('gulp-livereload')
var lrserver = require('tiny-lr')()
var buildServer = require('./server/express')
var sketch = require('gulp-sketch');
var replace = require('gulp-replace');
var clean = require('gulp-clean')

// server --------------------------------- //

var livereloadport = 35729
var serverport = 8080
var server = buildServer()

gulp.task('serve', function() {
  server.listen(serverport);
  lrserver.listen(livereloadport);
})

// main tasks ------------------------------ //

gulp.task('styles', function(){
  gulp.src('./app/application.scss')
    .pipe(sass())
    .pipe(prefix())
    .pipe(gulp.dest('./build/assets/css/'))
    .pipe(gulp.dest('./cordova/www/assets/css/'))
    .pipe(refresh(lrserver));
});

gulp.task('scripts', function(){
  gulp.src('./app/ios.js')
    .pipe(gulp.dest('./cordova/www/assets/js/'));

  var bundler = browserify('./app/application.js')
  bundle(bundler, './application.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(gulp.dest('./cordova/www/assets/js/'))
    .pipe(refresh(lrserver));
});

gulp.task('loader', function(){
  var bundler = browserify('./app/loader/nope.js')
  bundle(bundler, './nope.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(gulp.dest('./cordova/www/assets/js/'));

  var bundler = browserify('./app/loader/index.js')
  bundle(bundler, './loader.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(gulp.dest('./cordova/www/assets/js/'))
    .pipe(refresh(lrserver));
});

gulp.task('html', function(){
  var injectScripts = ['cordova.js', 'assets/js/ios.js'];
  var injectTags = injectScripts.map(function(src) {
    return '  <script src="'+src+'"></script>'
  }).concat('</head>').join('\n');

  gulp.src('./app/index.html')
    .pipe(gulp.dest('./build/'))
    .pipe(replace('</head>', injectTags))
    .pipe(gulp.dest('./cordova/www/'))
    .pipe(refresh(lrserver));
});

gulp.task('clean-assets', function(){
  return gulp.src('./build/assets/', {read: false})
    .pipe(clean())
});

gulp.task('assets', ['clean-assets'], function(){
  gulp.src('./app/assets/**/*')
    .pipe(gulp.dest('./build/assets/'))
    .pipe(gulp.dest('./cordova/www/assets/'))
    .pipe(refresh(lrserver));
});

gulp.task('tests', function(){
  var bundler = browserify()
  glob.sync("./app/@(widgets|lib)/*/test/*").forEach(function(file){
    bundler.add(file)
  })
  bundle(bundler, './index.js')
    .pipe(gulp.dest('./build/assets/js/tests/'));
});

function bundle(bundler, outFilename){
  bundler = bundler.transform('ractify')
  if(process.env.NODE_ENV === "production") {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  return bundler.bundle()
    .on('error', function (err) {
      console.error('Browserify Error')
      console.error(err.message);
      console.error(err.stack)
      this.emit("end");
    })
    .pipe(source(outFilename))
}

// watch ---------------------------------- //

gulp.task('watch', function() {

  gulp.watch(['app/**/*.scss'], ['styles']);
  gulp.watch(['app/**/*.js', 'app/**/*.ract', '!app/**/node_modules/**/*'], ['loader', 'scripts', 'tests']);
  gulp.watch('app/assets/**/*', ['assets']);
  gulp.watch('app/index.html', ['html']);
  gulp.watch(['app/**/test/*.js', '!app/**/node_modules/**/*'], ['tests']);

});

// $ gulp sketch -------------------------- //

gulp.task('sketch', function() {
  gulp.src('./app/assets-master.sketch')
    .pipe(sketch({
      export: 'artboards'
    }))
    .pipe(gulp.dest('./app/assets/img/'));
});

gulp.task('cordova-icons', function() {
  gulp.src('./cordova/assets-cordova.sketch')
    .pipe(sketch({
      export: 'artboards',
      items: [
        'icon-40',
        'icon-50',
        'icon-60',
        'icon-72',
        'icon-76',
        'icon-small',
        'icon'
        ]
    }))
    .pipe(gulp.dest('./cordova/platforms/ios/Hive/Resources/icons/'));
});

gulp.task('cordova-splash', function() {
  gulp.src('./cordova/assets-cordova.sketch')
    .pipe(sketch({
      export: 'artboards',
      items: [
        'Default',
        'Default-Landscape',
        'Default-Portrait',
        'Default-568h@2x~iphone'
        ]
    }))
    .pipe(gulp.dest('./cordova/platforms/ios/Hive/Resources/splash/'));
})

// $ gulp build --------------------------- //

gulp.task('build', ['html', 'loader', 'scripts', 'styles', 'assets', 'tests']);

// $ gulp ---------------------------------- //

gulp.task('default', ['loader', 'scripts', 'styles', 'html', 'assets', 'tests', 'serve', 'watch']);
