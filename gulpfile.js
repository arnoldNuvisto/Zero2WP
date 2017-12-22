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
var devDir 					= './build/dev/';
var distDir					= './build/dist/';
var themeName 				= 'nuvisto';
var themeDir 				= 'wordpress/wp-content/themes/';
var pluginsDir 				= 'wordpress/wp-content/plugins/';

// Translation related.
var text_domain             = 'WPGULP'; // Your textdomain here.
var translationFile         = 'WPGULP.pot'; // Name of the transalation file.
var translationDestination  = './languages'; // Where to save the translation files.
var packageName             = 'WPGULP'; // Package name.
var bugReport               = 'https://AhmadAwais.com/contact/'; // Where can users report bugs.
var lastTranslator          = 'Ahmad Awais <your_email@email.com>'; // Last translator Email ID.
var team                    = 'WPTie <your_email@email.com>'; // Team's Email ID.

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

// Images related.
var imagesSRC               = './assets/img/raw/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination       = './assets/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

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
var gulp 			= require('gulp');
var gutil 			= require('gulp-util');
var del 			= require('del');
var fs 				= require('fs');
var inject 			= require('gulp-inject-string');
var remoteSrc 		= require('gulp-remote-src');
var unzip 			= require('gulp-unzip');

/* -------------------------------------------------------------------------------------------------
Installation Tasks
> npm run install:wordpress
-------------------------------------------------------------------------------------------------- */
gulp.task('default');

/**
 * Task: 'cleanup'.
 *
 * Removes any previous 'dev' and 'dist' directories:
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
 * Task: 'download-wordpress'.
 *
 * Retrieves the most recent version of Wordpress:
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
 * Task: 'setup-wordpress'.
 *
 * Installs Wordpress to the 'dev' folder:
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
 * Unzips the Wordpress zip file into the 'dev' folder:
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
 * Copies a default 'wp-config.php' file into the 'dev' folder:
 *
 *	1. If a file exists:
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
 * Ensures that 'cron' is disabled in the 'wp-config.php' file:
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
var wpFy = '\x1b[42m\x1b[1mWordPressify\x1b[0m';
var wpFyUrl = '\x1b[2m - http://www.wordpressify.co/\x1b[0m';
var thankYou = 'Thank you for using ' + wpFy + wpFyUrl;

