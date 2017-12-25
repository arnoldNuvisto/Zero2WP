'use strict';
/**
 * gulpfile.js
 *
 * Zero2WP
 *
 * @author Arnold Wytenburg (@startupfreak)
 * @version 0.0.2
 */
/**
 * Configuration... Edit these variables to set up your project.
 *
 * @NOTE: You can specify <<glob or array of globs>> n paths. 
 */
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING HERE

// Project related.
var projectName             = 'Zero2WP';
var projectURL              = '/' + projectName + '/build/wordpress/';
var proxyAddress			= '127.0.0.1' + projectURL;

var devDir 					= './build/';
var distDir					= './dist/';
var componentsDir			= './components/';
var assetsDir 				= {
	css 	: componentsDir + 'assets/css/',
	fonts 	: componentsDir + 'assets/fonts/',
	img 	: componentsDir + 'assets/img/',
	js 		: componentsDir + 'assets/js/'
};

var themesDir 				= 'wordpress/wp-content/themes/';
var themeName 				= 'nuvisto';
var themeDir 				= themesDir + themeName;
var pluginsDir 				= 'wordpress/wp-content/plugins/';

// Images related.
//const images = { // ES6 syntax
var images 					= {
  src 	: assetsDir.img + 'raw/**/*.{png,jpg,gif,svg}',
  dest  : assetsDir.img
};
//var imagesSRC               = './assets/img/raw/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
//var imagesDestination       = './assets/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Translation related.
var text_domain             = 'WPGULP'; // Your textdomain here.
var translationFile         = 'WPGULP.pot'; // Name of the transalation file.
var translationDestination  = './languages'; // Where to save the translation files.
var packageName             = 'WPGULP'; // Package name.
var bugReport               = 'https://arnoldwytenburg.com/'; // Where can users report bugs.
var lastTranslator          = 'Arnold Wytenburg <arnold@arnoldwytenburg.com>'; // Last translator Email ID.
var team                    = 'Arnold Wytenburg <arnold@arnoldwytenburg.com>'; // Team's Email ID.

// Style related.
var styleSRC                = './assets/css/style.scss'; // Path to main .scss file.
var styleDestination        = './'; // Path to place the compiled CSS file.
// Default set to root folder.

// JS Vendor related.
var jsVendorSRC             = './assets/js/vendor/*.js'; // Path to JS vendor folder.
var jsVendorDestination     = './assets/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile            = 'vendors'; // Compiled JS vendors file name.
// Default set to vendors i.e. vendors.js.

// JS Custom related.
var jsCustomSRC             = './assets/js/custom/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination     = './assets/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile            = 'custom'; // Compiled JS custom file name.
// Default set to custom i.e. custom.js.

// Watch files paths.
var styleWatchFiles         = './assets/css/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles      = './assets/js/vendor/*.js'; // Path to all vendor JS files.
var customJSWatchFiles      = './assets/js/custom/*.js'; // Path to all custom JS files.
var projectPHPWatchFiles    = './**/*.php'; // Path to all PHP files.

// Browsers you care about for autoprefixing.
// Browserlist is at https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
  ];

// STOP EDITING HERE
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Load Plugins
-------------------------------------------------------------------------------------------------- */
var browserSync  	= require('browser-sync');
var gulp 			= require('gulp');
var gutil 			= require('gulp-util');
var del 			= require('del');
var fs 				= require('fs');
var imagemin      	= require('gulp-imagemin');
var inject 			= require('gulp-inject-string');
var newer    		= require('gulp-newer');
var plumber 		= require('gulp-plumber');
var remoteSrc 		= require('gulp-remote-src');
var unzip 			= require('gulp-unzip');

var reload       = browserSync.reload; // For manual browser reload.

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Installation Tasks
 * 
 * run "npm run install:wordpress"
 *
 * Installs a fresh copy of wordpress into the project's dev directory:
 *
 *	1. 'cleanup': Removes any previous 'dev' and 'dist' directories
 *	2. 'download-wordpress': Retrieves the most recent version of Wordpress
 *	3. 'setup-wordpress': Installs Wordpress into the project folder
 *		3.1 'unzip-wordpress': Unzips the Wordpress zip file into the 'dev' folder
 *		3.2 'copy-config': Copies an optional default 'wp-config.php' file into the 'dev' folder
 *	4. 'disable-cron': Ensures that 'cron' is disabled in the 'wp-config.php' file
 *
 */
/**
 * Task: 'cleanup'
 *
 *	1. Gets rid of a pre-exisiting 'dev' folder, if present
 *	2. Gets rid of a pre-exisiting 'dist' folder, if present
 *
 */
gulp.task('cleanup', function () {
	del([devDir + '**']);
	del([distDir + '**']);
});

/**
 * Task: 'download-wordpress'
 *
 *	1. Gets a zip file containing the most recent version of Wordpress from wordpress.org
 *	2. Places the file into the 'dev' folder for installation
 *
 */
gulp.task('download-wordpress', function () {
	remoteSrc(['latest.zip'], {
		base: 'https://wordpress.org/'
	})
		.pipe(gulp.dest(devDir));
});

/**
 * Task: 'setup-wordpress'
 *
 *	1. Runs a task to unzip the downloaded file
 *	2. Runs a task to copy over a default 'wp-config.php' file, if one exists
 *
 */
gulp.task('setup-wordpress', [
	'unzip-wordpress',
	'copy-config'
]);

/**
 * Task: 'unzip-wordpress'.
 *
 *	1. Unzip the downloaded file
 *	2. Place the unzipped Wordpress files into the 'dev' folder
 *
 */
gulp.task('unzip-wordpress', function () {
	gulp.src(devDir + 'latest.zip')
		.pipe(unzip())
		.pipe(gulp.dest(devDir));
});

/**
 * Task: 'copy-config'.
 *
 *	1. If a default config file exists:
 		1.1 Update the file to disable 'cron'
 *		1.2 Place the file into the 'dev' folder
 *	3. Notify the user that the install is completed
 *
 * NOTE: including the 'wp-config.php' file is optional - which is why there is an 
 * 'on('end, ... )' instruction included here: without this instruction, the script would bork if 
 * it doesn't find a file; including the stmt forces closure.
 *
 */
gulp.task('copy-config', function () {
	gulp.src('wp-config.php')
		.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
		.pipe(gulp.dest(devDir + 'wordpress'))
		.on('end', function () {
				gutil.beep();
				gutil.log(devServerReady);
				gutil.log(thankYou);
			});
});

/**
 * Task: 'disable-cron'.
 *
 *	1. Check the 'wp-config.php' file
 *	2. Disable 'cron' if not already disabled
 *
 */
gulp.task('disable-cron', function () {
	fs.readFile(devDir + 'wordpress/wp-config.php', function (err, data) {
		if (err) {
			gutil.log(wpFy + ' - ' + errorMsg + ' Something went wrong, WP_CRON was not disabled!');
			process.exit(1);
		}
		if (data.indexOf('DISABLE_WP_CRON') >= 0){
			gutil.log('WP_CRON is already disabled!');
		} else {
			gulp.src(buildDir + 'wordpress/wp-config.php')
			.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
			.pipe(gulp.dest(devDir + 'wordpress'));
		}
	});
});
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Build Tasks
 * 
 * run "gulp"
 *
 * Updates the current project's theme files in the dev directory:
 *
 *	1. 
 *
 */
/**
 * Task: 'default'
 *
 *	1. Runs all of the specified 'build tasks', in order
 *
 */
 //gulp.task('default', ['buildTasks']);
gulp.task('default', ['browser-sync']);

var buildTasks = [
	'copy-assets',
	'copy-includes',
	'copy-languages',
	'copy-plugins',
	'copy-src',
	'watch'
];

/**
 * Task: 'copy-assets'
 *
 *	1. Runs all of the 'build tasks' related to processing and copying the 
 *	the project's asset files to the 'dev' directiory, in order
 *
 */
gulp.task('copy-assets', ['copy-css','copy-fonts','compress-images','copy-images','copy-js']);

/**
 * Task: 'copy-css'
 *
 *	1. Pre-process the project's CSS, PostCSS, SASS, and/or LESS files as needed
 *	2. Copy the project's compiled CSS files to the 'dev' directory
 *
 */
gulp.task('copy-css', function(){

});


gulp.task('style-dev', function () {
	return gulp.src('src/css/style.css')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sourcemaps.init())
		.pipe(postcss(pluginsDev))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(buildDir + themeDir + themeName + DS + 'assets' + DS + 'css'))
		.pipe(browserSync.stream({ match: '**/*.css' }));
});


/**
 * Task: 'copy-fonts'
 *
 *	1. Copy the project's font files to the 'dev' directory
 *
 */
gulp.task('copy-fonts', function(){

});

/**
 * Task: 'compress-images'
 *
 *	1. Check for and compress any uncompressed project images
 *
 */
//gulp.task('compress-images', () => { // ES6 syntax
gulp.task('compress-images', function() {
  return gulp.src(images.src)
    .pipe(newer(images.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(images.dest));
});

/**
 * Task: 'copy-images'
 *
 *	1. Copy the project's image files to the 'dev' directory
 *
 */
gulp.task('copy-images', function(){

});

/**
 * Task: 'copy-js'
 *
 *	1. Pre-process the project's JS files
 *	2. Copy the project's compiled JS files to the 'dev' directory
 *
 */
gulp.task('copy-js', function(){

});

/**
 * Task: 'copy-includes'
 *
 *	1. Copy the project's 'include' files to the 'dev' directory
 *
 */
gulp.task('copy-includes', function(){

});

/**
 * Task: 'copy-languages'
 *
 *	1. Copy the project's 'languages' files to the 'dev' directory
 *
 */
gulp.task('copy-languages', function(){

});

/**
 * Task: 'copy-plugins'
 *
 *	1. Copy the project's 'plugins' to the 'dev' directory
 *
 */
gulp.task('copy-plugins', function(){

});

/**
 * Task: 'copy-src'
 *
 *	1. Copy the project's 'src' files and folders to the 'dev' directory
 *
 */
gulp.task('copy-src', function(){

});

/**
 * Task: 'watch'
 *
 *	1. Watch for file changes and run appropriate specific tasks.
 *
 */
gulp.task('watch', function(){

});
/*
gulp.task('copy-theme-dev', function () {
	if (!fs.existsSync(buildDir)) {
		gutil.log(buildNotFound);
		process.exit(1);
	} else {
		gulp.src('src/theme/**')
			.pipe(gulp.dest(buildDir + themeDir + themeName));
	}
});

gulp.task('copy-fonts-dev', function () {
	gulp.src('src/fonts/**')
		.pipe(gulp.dest(buildDir + themeDir + themeName + DS + 'assets' + DS + 'fonts'));
});

gulp.task('copy-images-dev', function () {
	gulp.src('src/img/**')
		.pipe(gulp.dest(buildDir + themeDir + themeName + DS + 'assets' + DS + 'images'));
});
*/
/**
 * Task: 'browser-sync'
 *
 * Live browser reloading, CSS injection, and localhost tunneling:
 *
 *	1. Specifies the project URL
 *	2. Allows using a custom port
 *	3. Allows stopping the browser from opening automatically
 *	4. Allows turning off Browsersync popups in the browser
 *	5. Allows forcing a page refresh on changes to CSS files (instead of injecting CSS into the DOM)
 * 
 * @link http://www.browsersync.io/docs/options/
 *
 */
 gulp.task( 'browser-sync', function() {
  browserSync.init( {
    proxy: proxyAddress, // Using localhost sub directories
    //port: 7000, // Use a specific port (instead of the one auto-detected by Browsersync)
    //open: false, // Stop the browser from automatically opening
    //notify: false, // Don't show any notifications in the browser
    //injectChanges: false // Don't try to inject, just do a page refresh
  });
});

gulp.watch('**/*.php').on('change', function () {
    browserSync.reload();
});

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Utility Tasks
-------------------------------------------------------------------------------------------------- */
var onError = function (err) {
	gutil.beep();
	gutil.log(wpFy + ' - ' + errorMsg + ' ' + err.toString());
	this.emit('end');
};

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Utility Variables
-------------------------------------------------------------------------------------------------- */
var date = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
var errorMsg = '\x1b[41mError\x1b[0m';
var devServerReady = 'Your development server is ready, start the workflow with the command: $ \x1b[1mnpm run dev\x1b[0m';
var buildNotFound = errorMsg + ' ⚠️　- You need to install WordPress first. Run the command: $ \x1b[1mnpm run install:wordpress\x1b[0m';
var filesGenerated = 'Your ZIP template file was generated in: \x1b[1m' + __dirname + '/dist/' + themeName + '.zip\x1b[0m - ✅';
var pluginsGenerated = 'Plugins are generated in: \x1b[1m' + __dirname + '/dist/plugins/\x1b[0m - ✅';
var backupsGenerated = 'Your backup was generated in: \x1b[1m' + __dirname + '/backups/' + date + '.zip\x1b[0m - ✅';
var wpFy = '\x1b[1mZero2WP\x1b[0m';
var wpFyUrl = '\x1b[2m - https://github.com/arnoldNuvisto/Zero2WP\x1b[0m';
var thankYou = 'Thank you for using ' + wpFy + wpFyUrl;

