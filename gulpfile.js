const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const postcssCombineDuplicatedSelectors = require('postcss-combine-duplicated-selectors');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const browserSync = require('browser-sync').create();
const del = require('del');

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/minimal-browsersync-setup-with-gulp4.md

function transformStyles() {
  return src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest('./dist/css'));
}

function buildStyles() {
  return src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), postcssSortMediaQueries(), postcssCombineDuplicatedSelectors(), cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist/css'));
}

function clean() {
  return del(['./dist', './public/css']);
}

function copyStylesToPublic() {
  return src('./dist/css/**/*.css').pipe(dest('./public/css'));
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: './public',
    },
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  watch('./public/**/*.html', reload);
  watch('./src/**/*.scss', series(transformStyles, copyStylesToPublic, reload));
}

exports.build = buildStyles;
exports.clean = clean;
exports.default = series(clean, transformStyles, copyStylesToPublic, serve, watchFiles);
