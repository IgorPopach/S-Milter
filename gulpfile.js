var syntax        = 'sass'; // Syntax: sass or scss;

var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync');

function browserSync() {
	return browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
};

function styles() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
};

function js() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/mmenu/dist/mmenu.js',
		'app/libs/OwlCarousel/dist/owl.carousel.min.js',
		'app/libs/equalheights/equalheights.js',
		'app/libs/fotorama/fotorama.js',
		'app/libs/selectize/js/standalone/selectize.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
};

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

var watchers = function () {
	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', styles);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], js);
	gulp.watch('app/*.html').on('change', browsersync.reload)
}

gulp.task('watch', watchers);

gulp.task('default', gulp.parallel('watch', styles, js, browserSync));
