const gulp = require("gulp");

exports.default = function () {
  gulp
    .src(
      [
        "src/**/*.html",
        "src/**/*.css",
        "src/fonts/**/*",
        "src/images/**/*",
        "src/internal/**/*",
      ],
      { base: "src" }
    )
    .pipe(gulp.dest("build/"));
  gulp.src("package.json").pipe(gulp.dest("build/"));
  return gulp
    .src(["node_modules/flag-icon-css/**/*", "node_modules/@mdi/**/*"], {
      base: "node_modules",
    })
    .pipe(gulp.dest("build/node_modules"));
};
