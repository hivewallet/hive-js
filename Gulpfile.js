var gulp = require('gulp')
var gutil = require('gulp-util')
var sass = require('gulp-sass')
var prefix = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var embedlr = require('gulp-embedlr')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var glob = require('glob')
var refresh = require('gulp-livereload')
var livereload = require('connect-livereload')
var lrserver = require('tiny-lr')()
var buildServer = require('./server/express')

// server --------------------------------- //

var livereloadport = 35729
var serverport = 8080
var server = buildServer(livereload({
  port: livereloadport
}))

gulp.task('serve', function() {
  server.listen(serverport);
  lrserver.listen(livereloadport);
});

// main tasks ------------------------------ //

gulp.task('styles', function(){
  gulp.src('./app/application.scss')
    .pipe(sass({sourceComments: 'map'})) // {sourceComments: 'map'} doesn't work in windows :/
    .pipe(prefix())
    .pipe(gulp.dest('./build/assets/css/'))
    .pipe(refresh(lrserver));
});

gulp.task('scripts', function(){
  var bundler = browserify('./app/application.js')
  bundle(bundler, './application.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(refresh(lrserver));
});

gulp.task('html', function(){
  gulp.src('./app/index.html')
    .pipe(gulp.dest('./build/'))
    .pipe(refresh(lrserver));
});

gulp.task('assets', function(){
  gulp.src('./app/assets/**/*')
    .pipe(gulp.dest('./build/assets/'))
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
  return bundler
    .transform('ractify')
    .bundle()
    .on('error', function (err) {
      console.log(err.toString());
      this.emit("end");
    })
    .pipe(source(outFilename))
}

// watch ---------------------------------- //

gulp.task('watch', function() {

  gulp.watch(['app/**/*.scss'], ['styles']);
  gulp.watch(['app/**/*.js', 'app/**/*.ract', '!app/**/node_modules/**/*'], ['scripts']);
  gulp.watch('app/assets/**/*', ['assets']);
  gulp.watch('app/index.html', ['html']);
  gulp.watch(['app/**/test/*.js', '!app/**/node_modules/**/*'], ['tests']);

});

// $ gulp build ---------------------------------- //

gulp.task('build', ['html', 'scripts', 'styles', 'assets']);

// $ gulp ---------------------------------- //

gulp.task('default', ['scripts', 'styles', 'html', 'assets', 'tests', 'serve', 'watch']);
