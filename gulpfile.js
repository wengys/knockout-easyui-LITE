var gulp = require('gulp');
var typescript=require("typescript")
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var del = require("del");
var runSequence = require('run-sequence');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
    startFragment: "src/util/start.js.fragment",
    srcs: [
        "src/util/*.ts",
         "src/*.ts"
        //,"src/datagrid.ts"
    ],
    endFragment: "src/util/end.js.fragment",
    target: "build",
    outputFileName: "knockout-easyui"
}

gulp.task('clean', function(cb) {
    del(paths.target+"/*", cb);
});

gulp.task("compile", function() {
    return gulp.src(paths.srcs)
        .pipe(ts({
            target: "ES3",
            declarationFiles: false,
            noExternalResolve: false,
            removeComments: true,
            sortOutput: true,
            typescript:typescript
        })).on("error", gutil.log)
        .pipe(concat(paths.outputFileName + ".debug.js"))
        .pipe(gulp.dest(paths.target))
})

gulp.task("compile_amd", ["compile"], function() {
    return gulp.src([
            paths.startFragment,
            paths.target + "/" + paths.outputFileName + ".debug.js",
            paths.endFragment
        ])
        .pipe(concat(paths.outputFileName + ".amd.debug.js"))
        .pipe(gulp.dest(paths.target))
})

gulp.task("uglify",["compile"],  function() {
    return gulp.src(paths.target + "/" + paths.outputFileName + ".debug.js")
        .pipe(sourcemaps.init())
        .pipe(uglify({}))
        .pipe(rename(function(path){
            path.basename=paths.outputFileName
        }))
        .pipe(sourcemaps.write("./",{ includeContent:true,sourceRoot:"./src"}))
        .pipe(gulp.dest(paths.target))
})

gulp.task("uglify_amd",["compile_amd"],  function() {
    return gulp.src(paths.target + "/" + paths.outputFileName + ".amd.debug.js")
        .pipe(sourcemaps.init())
        .pipe(uglify({}))
        .pipe(rename(function(path){
            path.basename=paths.outputFileName + ".amd"
        }))
        .pipe(sourcemaps.write("./",{ includeContent:true,sourceRoot:"./src"}))
        .pipe(gulp.dest(paths.target))
})

gulp.task("default", function() {
    runSequence("clean", ["uglify","uglify_amd"]);
});

gulp.task("build", function() {
    runSequence("clean", "compile_amd");
});

gulp.task("watch", function() {
    gulp.watch(paths.srcs, ["build"]);
});
