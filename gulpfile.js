var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var filter = require('gulp-filter');
var runSequence = require('run-sequence');
var coffeelint = require('gulp-coffeelint');
var plumber = require('gulp-plumber');

var paths = {
    srcs: [
        "src/util/*.coffee",
        "src/*.coffee"
        //  "src/calendar.coffee"
     ],
    target: "build",
    outputFileName: "knockout-easyui"
}

var jsFilter = filter("**/*.js");

gulp.task("clean", function() {
    return gulp.src(paths.target, {
        read: false
    }).pipe(clean())
});

gulp.task("lint", function() {
    return gulp.src(paths.srcs)
        .pipe(coffeelint())
        .pipe(coffeelint.reporter())
});

gulp.task("build", function() {
    return gulp.src(paths.srcs)
        .pipe(plumber())
        .pipe(concat(paths.outputFileName + ".coffee"))
        .pipe(gulp.dest(paths.target))
        .pipe(coffee()).on("error", gutil.log)
        .pipe(gulp.dest(paths.target))
        .pipe(jsFilter)
        .pipe(uglify({
        }))
        .pipe(rename(function(path) {
            if (path.extname === ".js") {
                path.extname = ".min.js";
            }
        }))
        .pipe(gulp.dest(paths.target))
});

gulp.task("default", function() {
    runSequence("clean", ["lint", "build"]);
});

gulp.task("watch",function() {
    gulp.watch(paths.srcs,["build"]); 
});
