var gulp = require("gulp");
var ts = require("gulp-typescript");
var sourcemaps = require('gulp-sourcemaps');

var gulpWebpack = require('gulp-webpack');
var webpack = require('webpack');

gulp.task('default', function () {
    gulp.start('compile-client');
    gulp.start('compile-service');
});

gulp.task('compile-client', function() {
    gulp.src('client/**/*.ts')
    .pipe(gulpWebpack({
        output: {
            filename: 'client.js',
        },
        module: {
            loaders: [
                { test: /\.ts$/, loader: 'ts-loader' }
            ]
        },
        devtool: 'source-map',
        //plugins: [new webpack.optimize.UglifyJsPlugin()],
    }, webpack))
    .pipe(gulp.dest('./client/dist'));
});

gulp.task('compile-service', function() {
    return gulp.src('service/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            target: 'ES5'
        }))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../'}))
        .pipe(gulp.dest('service/dist'));
});

gulp.task('watch', function () {
  gulp.watch('client/**/*.ts', ['compile-typescript']);
});