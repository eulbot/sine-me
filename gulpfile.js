var gulp = require("gulp");
var gutil = require("gulp-util");
var ts = require("gulp-typescript");
var concat = require("gulp-concat");
var sourcemaps = require('gulp-sourcemaps');
var webpack = require('webpack');
var webpackConfig = require("./webpack.config.js");

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

var devCompiler = webpack(myDevConfig);

gulp.task('default', function () {
    gulp.start('compile-service');
    gulp.start('compile-client');
});

gulp.task('compile-service', function() {
    return gulp.src('service/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({ target: 'ES5' }))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../'}))
        .pipe(gulp.dest('service/dist'));
});

gulp.task('compile-ts-client', function() {
    return gulp.src('client/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({ target: 'ES5' }))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../'}))
        .pipe(gulp.dest('client/dist'));
});

gulp.task("compile-client", ['compile-ts-client'], function(callback) {
	devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError("compile-webpack-client", err);
		gutil.log("[compile-webpack-client]", stats.toString({
			colors: true
		}));
		callback();
	});
});