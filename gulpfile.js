var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require('gulp-less');
var clean = require('gulp-clean');
var ts = require("gulp-typescript");
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var webpack = require('webpack');
var webpackConfig = require("./webpack.config.js");

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
//myDevConfig.debug = false;

var devCompiler = webpack(myDevConfig);

gulp.task('default', function () {
    gulp.start('compile-service');
    gulp.start('compile-client');
});

gulp.task('compile-service', function() {
    return gulp.src('service/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({ target: 'ES5' }))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../'}))
        .pipe(gulp.dest('service/dist'));
});

gulp.task("compile-client", ['compile-client-webpack', 'prefix-client-css'], function(callback) {
    return gulp.src(['client/src/*.js', 'client/src/*.map'], {read: false})
        .pipe(clean());
});

gulp.task('compile-client-webpack', ['compile-client-ts'], function (callback) {
	return devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError("compile-webpack-client", err);
		gutil.log("[compile-webpack-client]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task('compile-client-ts', function() {
    return gulp.src('client/src/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({ target: 'ES5'}))
        .pipe(sourcemaps.write('.', {includeContent: false}))
        .pipe(gulp.dest('client/src'));
});

gulp.task('compile-client-less', function () {
    return gulp.src('client/styles/*.less')
        .pipe(less())
        .pipe(gulp.dest('client/dist'));
});

gulp.task('prefix-client-css', ['compile-client-less'], function()  {
    gulp.src('client/dist/client.css')
    .pipe(autoprefixer({
        browsers: ['last 3 version'],
        cascade: false
    }))
    .pipe(gulp.dest('client/dist'))
})