// Gulp is used to move static files
// I.E. html, css, images, etc.
// Files to the build folder

const gulp = require("gulp");

exports.default = function () {
  // Copies over html, css, and fonts, images, internal folders to build folder
  gulp
    .src(
      [
        "src/**/*.html",
        "src/**/*.css",
        "src/fonts/**/*",
        "src/images/**/*",
        "src/internal/**/*",
      ],
      // Needed to keep folder structure
      { base: "src" }
    )
    .pipe(gulp.dest("build/"));
  // Copies over package.json due to GetCurrentVersion reading it
  gulp.src("package.json").pipe(gulp.dest("build/"));
  // Copies over only the needed node_modules css files to build folder
  return gulp
    .src(["node_modules/flag-icon-css/**/*", "node_modules/@mdi/**/*"], {
      // Again, Needed to keep folder structure
      base: "node_modules",
    })
    .pipe(gulp.dest("build/assets"));
};
