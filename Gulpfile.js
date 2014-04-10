
var gulp            = require('gulp'),
    gutil           = require('gulp-util'),
    sass            = require('gulp-sass'),
    browserify      = require('gulp-browserify'),
    prefix          = require('gulp-autoprefixer'),
    concat          = require('gulp-concat'),
    embedlr         = require('gulp-embedlr'),
    refresh         = require('gulp-livereload'),
    livereload      = require('connect-livereload'),
    lrserver        = require('tiny-lr')(),
    server          = require('./server/express'),
    livereloadport  = 35729,
    serverport      = 8080;

// server --------------------------------- //

server.use(livereload({
  port: livereloadport
}));

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
  gulp.src('./app/application.js')
    .pipe(browserify({
      transform: ['ractify'],
      extensions: ['.ract']
    }))
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
  gulp.src('./app/@(widgets|lib)/*/test/*')
    .pipe(browserify({
      transform: ['ractify'],
      extensions: ['.ract']
    }))
    .pipe(gulp.dest('./build/assets/js/tests/'));
});

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
