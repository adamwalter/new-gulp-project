'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync').create();

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var pxtorem = require('postcss-pxtorem');
var mqpacker = require('css-mqpacker');
var uniqueSelectors = require('postcss-unique-selectors');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var sourcemaps = require('gulp-sourcemaps');

var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');

// Initialize Browsersync proxy
gulp.task('browsersync', function() {
    browserSync.init({
        proxy: 'example.local',
		port: 1337,
		notify: false
    });
});

// Process Sass
gulp.task('sass', function() {

	return gulp.src('assets/sass/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
				outputStyle: 'compressed'
			}).on('error', sass.logError))
		.pipe(postcss([
	        autoprefixer({
			    expand: true,
			    flatten: true,
			    browsers: ['last 2 versions', '> 1%']
			}),
	        pxtorem({
			    propWhiteList: [
			        'font',
			        'font-size',
			        'line-height',
			        'letter-spacing',
			        'margin',
			        'margin-top',
			        'margin-right',
			        'margin-bottom',
			        'margin-left',
			        'padding',
			        'padding-top',
			        'padding-right',
			        'padding-bottom',
			        'padding-left'
			    ]
			}),
	        mqpacker({
			    sort: true
			}),
	        uniqueSelectors()
	    ]))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('assets/css'))
		.pipe(browserSync.stream());
});

// Lint JavaScript
gulp.task('jshint', function() {
	return gulp.src('assets/scripts/source/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
	  .pipe(jshint.reporter('fail'));
});

// Process JavaScript
gulp.task('js', gulp.series('jshint', function() {
	return gulp.src('assets/scripts/source/*.js')
        .pipe(gulp.dest('assets/scripts/site'));
}));

// Browsersync reloads for JS
gulp.task('js-watch', gulp.series('js', function(done) {
	browserSync.reload();
	done();
}));

// Process images
gulp.task('images', function() {
    return gulp.src('assets/images/source/*.{svg,png,gif,jpg,jpeg}')
        .pipe(changed('assets/images/'))
        .pipe(imagemin({
			optimizationLevel: 7
		}))
        .pipe(gulp.dest('assets/images/'));
});

// Browsersync reloads
gulp.task('reload-watch', function(done) {
	browserSync.reload();
	done();
});

// Default task
gulp.task('default', gulp.series('browsersync', function() {
	gulp.watch('assets/sass/**/*.scss', ['sass']);
	gulp.watch('assets/scripts/source/*.js', ['js-watch']);
	gulp.watch('./*.php', ['reload-watch']);
	gulp.watch('assets/images/source/*.{svg,png,gif,jpg,jpeg}', ['images', 'reload-watch']);
}));
