// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel, task } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const connect = require("gulp-connect");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
var replace = require("gulp-replace");
//var webserver = require("gulp-webserver");
// File paths
const files = {
  scssPath: "app/scss/**/*.scss",
  jsPath: "app/js/**/*.js",
  htmlPath: "app/*.html"
};

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(sass()) // compile SCSS to CSS
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(sourcemaps.write(".")) // write sourcemaps file in current directory
    .pipe(dest("dist/css"))
    .pipe(connect.reload()); // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
  return (
    src([
      files.jsPath
      //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
    ])
      // .pipe(concat("all.js"))
      // .pipe(uglify())
      .pipe(dest("dist/js"))
      .pipe(connect.reload())
  );
}

// Cachebust
var cbString = new Date().getTime();
function cacheBustTask() {
  return src(["app/*.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("dist"))
    .pipe(connect.reload());
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  watch(
    [files.scssPath, files.jsPath, files.htmlPath],
    parallel(scssTask, jsTask, cacheBustTask)
  );
}

function webServer() {
  return connect.server({
    root: "dist", // app for developement and dist for production testing
    livereload: true,
    port: 1234
  });
}
var filesToMove = ["app/assets/**/*.*"];

function move(done) {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  src("app/assets/**/*.*")
    .pipe(dest("dist/assets"))
    .pipe(connect.reload());
  done();
}
// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  move,
  parallel(watchTask, webServer)
);
