var gulp = require('gulp');
var path = require('path');
var ts = require('gulp-typescript');

gulp.task('build', function() {
    var tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    return gulp
            .src(path.resolve('./src/**/*.ts'))
            .pipe(ts(tsProject))
            .pipe(gulp.dest('./output'))
});

gulp.task('default', ['build']);
