'use strict';
/**
 * gulpfile.js
 *
 * Zero2WP
 *
 * @author Arnold Wytenburg (@startupfreak)
 * @version 0.0.2
 */
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING HERE
var projectName		= 'Brenda';
var server			= {
	host		: '127.0.0.1', // aka. 'localhost' on most systems
	customPort 	: null ,  // replace 'null' with a specific port instead of auto-detecting via Browsersync
	//customPort 	: '6000',  // for example
	open 		: 'external', // 
	notify 		: true, // Set to false to hide Browsersync notices in the browser
	inject 		: true // Set to false to force a page refresh instead of injecting changes
};
// STOP EDITING HERE

var _package 		= {
	name 	: projectName.toLowerCase()
};

var _theme 			= {
	dest 	: 'wordpress/wp-content/themes/' + _package.name + '/'
};

var _environment	= {
	dev 	: './build/' + _package.name + '/',
	dist 	: './dist/' + _package.name + '/',
	src 	: './themes/' + _package.name + '/'
};

var _fonts 			= {
	src 	: _environment.src + 'fonts/',
	dest 	: _environment.dev + _theme.dest + 'fonts/'
};

var _img 			= {
	src 	: _environment.src + 'img/',
	dest 	: _environment.dev + _theme.dest + 'img/'
};
// Images related:
//const images = { // ES6 syntax
//var images 					= {
//  src 	: assetsDir.img + 'raw/**/*.{png,jpg,gif,svg}',
//  dest  : assetsDir.img
//};
//var imagesSRC               = './assets/img/raw/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
//var imagesDestination       = './assets/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

var _includes 		= {
	src  	: _environment.src + 'inc/',
	dest 	: _environment.dev + _theme.dest + 'inc/'
};

var _js 			= {
	src 	: _environment.src + 'js/',
	dest 	: _environment.dev + _theme.dest + 'js/'
};

var _languages 		= {
	src  	: _environment.src + 'languages/',
	dest 	: _environment.dev + _theme.dest + 'languages/'
};
/*
var plugins 		= {
	src 	: _environment.src + 'plugins/', 
	dest 	: _environment.dev + 'wordpress/wp-content/plugins/'
};
*/

var _server 		= {
	proxy 			: server.host + '/Zero2WP/build/'  + _package.name + '/wordpress/',
	open 			: 'external',	
	notify 			: server.notify,
	injectChanges	: server.inject
};
if (server.customPort !== null){
	_server.port 	= server.customPort; 
}

var _style 			= {
	src 	: _environment.src + 'sass/',
	dest 	: _environment.dev + _theme.dest
};

var _templates 		= {
	src 	: _environment.src + '**/*.{php,css,png}',
	dest 	: _environment.dev + _theme.dest 
};

// See https://github.com/ai/browserslist
var AUTOPREFIXER_BROWSERS = [
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

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Load Plugins
-------------------------------------------------------------------------------------------------- */
var git 			= require('gulp-git');
var gulp 			= require('gulp');
var gutil 			= require('gulp-util');
var del 			= require('del');
var fs 				= require('fs');
var imagemin      	= require('gulp-imagemin');
var inject 			= require('gulp-inject-string');
var newer    		= require('gulp-newer');
var notify	        = require('gulp-notify');
var plumber 		= require('gulp-plumber');
var remoteSrc 		= require('gulp-remote-src');
var replace 		= require('replace-in-file');
var unzip 			= require('gulp-unzip');

// Browsersync related
var browserSync  	= require('browser-sync');
var reload       	= browserSync.reload;

// Style related
var assets 			= require('postcss-assets');
var autoprefixer 	= require('autoprefixer');
var cssmq 			= require('css-mqpacker'); // risky, not used
var cssnano 		= require('cssnano');
var cssnext 		= require('postcss-cssnext');
var partialimport 	= require('postcss-easy-import');
var postcss 		= require('gulp-postcss');
var sass 			= require('gulp-sass');
var sourcemaps 		= require('gulp-sourcemaps');
var pluginsDev 		= [
	partialimport,
	cssnext({
		features: {
			colorHexAlpha: false
		}
	})
];
var pluginsProd 	= [
	partialimport,
	cssnext({
		features: {
			colorHexAlpha: false
		}
	})
];

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Wordpress Installation
 * 
 * run "gulp install-wordpress" or "npm run install:wordpress"
 *
 * Installs a fresh copy of wordpress into the project's build directory:
 *
 *	1. 'cleanup': Removes any previous 'dev' and 'dist' directories for the project
 *	2. 'download-wordpress': Retrieves the most recent version of Wordpress
 *	3. 'setup-wordpress': Installs Wordpress into the project folder
 *		3.1 'unzip-wordpress': Unzips the Wordpress zip file into the project's build folder
 *		3.2 'copy-config': Copies an optional default 'wp-config.php' file
 *	4. 'disable-cron': Ensures that 'cron' is disabled in the 'wp-config.php' file
 *
 */
/**
 * Task: 'cleanup'
 *
 *	1. Empties a pre-exisiting 'dev' folder, if present
 *	2. Empties a pre-exisiting 'dist' folder, if present
 *
 */
gulp.task('cleanup-build', function (cb) {
	del([_environment.dev + '**/*']);
	return del([_environment.dist + '**/*']);
});

/**
 * Task: 'download-wordpress'
 *
 *	1. Retrieves a zip file containing the most recent version of Wordpress from wordpress.org
 *	2. Places the zip file into the 'dev' folder for installation
 *
 */
gulp.task('download-wordpress', ['cleanup-build'], function (cb) {
	return remoteSrc( ['latest.zip'], { base: 'https://wordpress.org/' } )
		.pipe(gulp.dest(_environment.dev))
    	.pipe( notify( { message: 'TASK: WP downloaded', onLast: true } ) );
});

/**
 * Task: 'unzip-wordpress'.
 *
 *	1. Unzips the downloaded file
 *	2. Places the unzipped Wordpress files into the 'dev' folder
 *
 */
gulp.task('unzip-wordpress', ['download-wordpress'], function (cb) {
	return gulp.src(_environment.dev + 'latest.zip')
		.pipe(unzip())
		.pipe(gulp.dest(_environment.dev))
    	.pipe( notify( { message: 'TASK: WP unzipped', onLast: true } ) );
});

/**
 * Task: 'copy-config'.
 *
 *	1. If a default config file exists:
 		1.1 Updates the file to disable 'cron'
 *		1.2 Places the file into the 'dev' folder
 *	3. Notifies the user that the install is completed
 *
 * NOTE: including the 'wp-config.php' file is optional - which is why there is an 
 * 'on('end, ... )' instruction included here: without this instruction, the script would bork if 
 * it doesn't find a file; including the stmt forces closure.
 *
 */
gulp.task('copy-config', ['unzip-wordpress'], function () {
	gulp.src('wp-config.php')
		.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
		.pipe(gulp.dest(_environment.dev + 'wordpress'))
		.on('end', function () {
				gutil.beep();
				gutil.log(projectReady);
				gutil.log(thanks);
			});
});

/**
 * Task: 'disable-cron'.
 *
 *	1. Checks the 'wp-config.php' file
 *	2. Disables 'cron' if not already disabled
 *
 */
gulp.task('disable-cron', function () {
	fs.readFile(_environment.dev + 'wordpress/wp-config.php', function (err, data) {
		if (err) {
			gutil.log(wpFy + ' - ' + errorMsg + ' Something went wrong, WP_CRON was not disabled!');
			process.exit(1);
		}
		if (data.indexOf('DISABLE_WP_CRON') >= 0){
			gutil.log('WP_CRON is already disabled!');
		} else {
			gulp.src(buildDir + 'wordpress/wp-config.php')
			.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
			.pipe(gulp.dest(_environment.dev + 'wordpress'));
		}
	});
});

/**
 * Task: 'install-wordpress'
 *
 *	1. Runs a task to unzip the downloaded file
 *	2. Runs a task to copy over a default 'wp-config.php' file, if one exists
 *
 */
gulp.task('install-wordpress', ['cleanup-build', 'download-wordpress', 'unzip-wordpress', 'copy-config']);

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Template Installation
 * 
 * run "gulp install-underscores" or "npm run install:underscores"
 *
 * Installs a fresh copy of the '_s' template source files into a project-specific subfolder:
 *
 *	1) Clone the '_s' repo
 *	2) Update the packageName in the style files
 *	3) Update the packageName in the remaining files
 *
 */
/**
 * Task: 'clone_s'
 *
 *	1. Clone the '_s' template into Zero2WP's 'themes' folder using the packageName 
 *
 */
gulp.task('clone_s', function(cb){
	return git.clone('https://github.com/Automattic/_s.git', {args: _environment.src}, function (err) {
		cb(err);
	});
});

/**
 * Task: 'replacePackageNameStyle'
 *
 *	1. Replaces '_s' with the packageName in the project's '.css' and '.scss' files
 *
 */
var styleOptions = {
  files: [_environment.src + '*.css', _environment.src + '**/*.scss'],
  from: [
  	/Theme Name: _s/g,
  	/Text Domain: _s/g
  ],
  to: [
  	'Theme Name: ' + _package.name, 
  	'Text Domain: ' + _package.name
  ]
};
gulp.task('replacePackageNameStyle', ['clone_s'], function() {
	replace(styleOptions, function(error, changes) {
	  if (error) {
	    console.error('Error occurred:', error);
	  }
	  console.log('Modified files:', changes.join(', '));
	});
});

/**
 * Task: 'replacePackageName'
 *
 *	1. Replaces '_s' with the packageName in the project's remaining files
 *
 */
var options = {
  files: _environment.src + '**/*',
  ignore: _environment.src + '*.css',
  from: [
  	/\b_s-/g, 
  	/\b _s/g, 
  	/\b_s_/g, 
  	/\b_s/g
  ],
  to: [
  	_package.name + '-', 
  	' ' + _package.name, 
  	_package.name + '_',
  	_package.name
  ]
};
gulp.task('replacePackageName', ['clone_s'], function() {
	replace(options, function(error, changes) {
	  if (error) {
	    return console.error('Error occurred:', error);
	  }
	  console.log('Modified files:', changes.join(', '));
	});
});

/**
 * Task: 'install-underscores'
 *
 *	1. Runs a task to clone the underscores template from GitHub
 *	2. Runs a task to update the template name in the .css and .scss files
 *	3. Runs a task to update the template name in the remaining files
 *
 */
gulp.task('install-underscores', ['clone_s', 'replacePackageNameStyle', 'replacePackageName']);

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Build Tasks
 * 
 * run "gulp build" or "npm run build"
 *
 * Adds/Updates the project's theme files in the project's build directory:
 *
 */
/**
 * Task: 'build'
 *
 *	1. Runs all of the specified 'build tasks'
 *
 */
gulp.task('build', [
	'load-templates',
	'load-includes',
	'load-languages',
	//'load-plugins',
	'load-assets',
	'watch'
]);

/**
 * Task: 'load-templates'
 *
 *	1. Loads the project's 'template' files and folders to the project build's theme directory
 *
 */
gulp.task('load-templates', function(){
	if (!fs.existsSync(_environment.dev)) {
		gutil.log(wpMissing);
		process.exit(1);
	} else {
		gulp.src(_templates.src)
			.pipe(gulp.dest(_templates.dest));
	}
});

/**
 * Task: 'load-includes'
 *
 *	1. Loads the project's 'include' files to the project build's theme directory
 *
 */
gulp.task('load-includes', function(){
	gulp.src(_includes.src + '**/*')
		.pipe(gulp.dest(_includes.dest));
});

/**
 * Task: 'load-languages'
 *
 *	1. Loads the project's 'languages' files to the project build's theme directory
 *
 */
gulp.task('load-languages', function(){
	gulp.src(_languages.src + '**/*')
		.pipe(gulp.dest(_languages.dest));
});

/**
 * Task: 'load-plugins'
 *
 *	1. Loads the project's 'plugins' to the project build's install directory
 *
 */
//gulp.task('load-plugins', function(){
//	gulp.src(plugins.src + '**/*'//)
//		.pipe(gulp.dest(plugins.dest));
//});

/**
 * Task: 'load-assets'
 *
 *	1. Runs all of the 'build tasks' related to processing and copying the 
 *	the project's asset files to the project build's directory
 *
 */
gulp.task('load-assets', ['load-styles','load-_fonts','load-images','load-js']);

/**
 * Task: 'load-styles'
 *
 *	1. Compiles the project's SCSS files to CSS
 *	2. Adds browser prefixes as needed
 *	3. Creates and saves a sourcemap for the CSS
 *	4. Loads the finalized CSS file into the project's build directory
 *
 */
var sassOpts = {
    outputStyle     : 'nested', // expanded
    imagePath       : _img.dest,
    precision       : 3,
    errLogToConsole : true,
	indentType		: 'tab',
	indentWidth		: '1'
};
gulp.task('load-styles', function(){
	return gulp.src(_style.src + '{style.scss,rtl.scss}')
		.pipe(plumber({ errorHandler: onError }))
		//.pipe(sourcemaps.init())
		.pipe(sass(sassOpts).on('error', sass.logError))
		.pipe(postcss([
			assets({
				loadPaths: [_img.src],
      			basePath: _environment.dev,
      			baseUrl: _theme.dest
      		}),
			autoprefixer(AUTOPREFIXER_BROWSERS)
		]))
		//.pipe(sourcemaps.write(_style.src + 'maps'))
		.pipe(gulp.dest(_style.dest))
		.pipe(browserSync.stream({ match: '**/*.css' }));
});

/**
 * Task: 'load-_fonts'
 *
 *	1. Loads the project's font files to the project build's theme directory
 *
 */
gulp.task('load-_fonts', function(){
	gulp.src(_fonts.src + '**/*')
		.pipe(gulp.dest(_fonts.dest));
});

/**
 * Task: 'load-images'
 *
 *	1. Loads the project's image files to the project build's theme directory
 *
 */
gulp.task('load-images', function(){
	gulp.src(_img.src + '**/*')
		.pipe(gulp.dest(_img.dest));
});

/**
 * Task: 'load-js'
 *
 *	1. Pre-processes the project's JS files
 *	2. Loads the project's compiled JS files to the project build's theme directory
 *
 */
gulp.task('load-js', function(){
	gulp.src(_js.src + '**/*')
		.pipe(gulp.dest(_js.dest));
});

/**
 * Task: 'compress-images'
 *
 *	1. Checks for and compresses any previously uncompressed project images
 *
 */
gulp.task('compress-images', function() {
  return gulp.src(_img.src)
    .pipe(newer(_img.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(_img.dest));
});

/**
 * Task: 'watch'
 *
 *	1. Initiate Browsersync
 *	2. Watch for file changes and run appropriate specific tasks.
 *
 */
gulp.task('watch', function(){

	browserSync.init(_server);

	gulp.watch(_style.src + '**/*', ['load-styles']); // stream changes
	gulp.watch(_fonts.src + '**/*', ['load-_fonts', reload]);
	gulp.watch(_img.src + '**', ['load-images']); // stream changes
	gulp.watch(_includes.src + '**/*', ['load-includes', reload]);
	gulp.watch(_js.src + '**/*', ['load-js', reload]);
	gulp.watch(_languages.src + '**/*', ['load-lang', reload]);
	//gulp.watch(plugins.src + '**/*', ['load-plugins', reload]);
	gulp.watch(_templates.src + '**/*', ['load-templates', reload]);
	
	gulp.watch(_environment.dev + 'wordpress/wp-config*.php', function(event){
		if(event.type === 'added') { 
			gulp.start('disable-cron');
		}
	});
});

/**
 * Task: 'default'
 *
 *	1. Launches the 'watch' task when the user runs the "gulp" or "gulp --verbose" command
 *
 */
gulp.task('default', ['watch']);

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
/**
 * @TODO: update/cleanup this stuff... push messages into an array or object
 */
var date = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
var errorMsg = '\x1b[41mHey you!\x1b[0m';
var projectReady = 'Your new WP project is ready. Start the workflow by running this command: $ \x1b[1mgulp\x1b[0m';
var wpMissing = errorMsg + ' Wordpress must be installed first. Run: $ \x1b[1mnpm run install:wordpress\x1b[0m';
var filesGenerated = 'Your ZIP template file was generated in: \x1b[1m' + __dirname + '/dist/' + _package.name + '.zip\x1b[0m - ✅';
var pluginsGenerated = 'Plugins are generated in: \x1b[1m' + __dirname + '/dist/plugins/\x1b[0m - ✅';
var backupsGenerated = 'Your backup was generated in: \x1b[1m' + __dirname + '/backups/' + date + '.zip\x1b[0m - ✅';
var wpFy = '\x1b[1mZero2WP\x1b[0m';
var wpFyUrl = '\x1b[2m - https://github.com/arnoldNuvisto/Zero2WP\x1b[0m';
var thanks = 'Thank you for using ' + wpFy + wpFyUrl;

