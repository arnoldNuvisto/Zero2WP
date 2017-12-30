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
/**
 * @TODO: sort out a toggle for child vs new themes
 */
var packageName 			= 'Marisa';
var packageName 			= packageName.toLowerCase(); // still need to strip out dashes & underscores
var themeDest 				= 'wordpress/wp-content/themes/' + packageName + '/';

var environment				= {
	proxy 	: '127.0.0.1/Zero2WP/build/wordpress/',
	dev 	: './build/',
	dist 	: './dist/',
	src 	: './components/'
};

var fonts 					= {
	src 	: environment.src + 'assets/fonts/',
	dest 	: environment.dev + themeDest + 'assets/fonts/'
};

var img 					= {
	src 	: environment.src + 'assets/img/',
	dest 	: environment.dev + themeDest + 'assets/img/'
};
// Images related:
//const images = { // ES6 syntax
//var images 					= {
//  src 	: assetsDir.img + 'raw/**/*.{png,jpg,gif,svg}',
//  dest  : assetsDir.img
//};
//var imagesSRC               = './assets/img/raw/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
//var imagesDestination       = './assets/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

var includes 				= {
	src  	: environment.src + 'inc/',
	dest 	: environment.dev + themeDest + 'inc/'
};

var js 						= {
	src 	: environment.src + 'assets/js/',
	dest 	: environment.dev + themeDest + 'assets/js/'
};

var languages 				= {
	src  	: environment.src + 'languages/',
	dest 	: environment.dev + themeDest + 'languages/'
};

var plugins 				= {
	src 	: environment.src + 'plugins/', 
	dest 	: environment.dev + 'wordpress/wp-content/plugins/'
};

var style 					= {
	src 	: environment.src + 'assets/css/' + 'sass/',
	dest 	: environment.dev + themeDest
};

var templates 				= {
	src 	: environment.src + 'src/',
	dest 	: environment.dev + themeDest 
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

// STOP EDITING HERE
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

//gulp.task('themeIt',['clone_s','replacePackageName']);
var styleOptions = {
  files: [environment.src + packageName + '/*.css', environment.src + packageName + '/**/*.scss'],
  from: [
  	/Theme Name: _s/g,
  	/Text Domain: _s/g
  ],
  to: [
  	'Theme Name: ' + packageName, 
  	'Text Domain: ' + packageName
  ]
};
var options = {
  files: environment.src + packageName + '/**/*',
  ignore: environment.src + packageName + '/*.css',
  from: [
  	/\b_s-/g, 
  	/\b _s/g, 
  	/\b_s_/g, 
  	/\b_s/g
  ],
  to: [
  	packageName + '-', 
  	' ' + packageName, 
  	packageName + '_',
  	packageName
  ]
};
// Clone the '_s' template
gulp.task('clone_s', function(){
  git.clone('https://github.com/Automattic/_s.git', {args: environment.src + packageName}, function (err) {
    if (err) throw err;
  });
});

// Replace '_s' with the packageName
gulp.task('replacePackageNameStyle', function() {
	replace(styleOptions, function(error, changes) {
	  if (error) {
	    return console.error('Error occurred:', error);
	  }
	  console.log('Modified files:', changes.join(', '));
	});
});

gulp.task('replacePackageName', function() {
	replace(options, function(error, changes) {
	  if (error) {
	    return console.error('Error occurred:', error);
	  }
	  console.log('Modified files:', changes.join(', '));
	});
});

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
 * @TODO: include a function to build out an installation-specific 'wp_config.php' file
 */
/**
 * Task: 'cleanup'
 *
 *	1. Empties a pre-exisiting 'dev' folder, if present
 *	2. Empties a pre-exisiting 'dist' folder, if present
 *
 */
gulp.task('cleanup', function () {
	del([environment.dev + '**/*']);
	del([environment.dist + '**/*']);
});

/**
 * Task: 'download-wordpress'
 *
 *	1. Retrieves a zip file containing the most recent version of Wordpress from wordpress.org
 *	2. Places the zip file into the 'dev' folder for installation
 *
 */
gulp.task('download-wordpress', function () {
	remoteSrc(['latest.zip'], {
		base: 'https://wordpress.org/'
	})
		.pipe(gulp.dest(environment.dev))
    	.pipe( notify( { message: 'TASK: WP downloaded', onLast: true } ) );
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
 *	1. Unzips the downloaded file
 *	2. Places the unzipped Wordpress files into the 'dev' folder
 *
 */
gulp.task('unzip-wordpress', function () {
	gulp.src(environment.dev + 'latest.zip')
		.pipe(unzip())
		.pipe(gulp.dest(environment.dev));
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
/**
 * @TODO: use '.on(error, blah blah) ', then move the copy stuff to a discreet function (???)
 * ... might be useful with creating the config file
 */
gulp.task('copy-config', function () {
	gulp.src('wp-config.php')
		.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
		.pipe(gulp.dest(environment.dev + 'wordpress'))
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
	fs.readFile(environment.dev + 'wordpress/wp-config.php', function (err, data) {
		if (err) {
			gutil.log(wpFy + ' - ' + errorMsg + ' Something went wrong, WP_CRON was not disabled!');
			process.exit(1);
		}
		if (data.indexOf('DISABLE_WP_CRON') >= 0){
			gutil.log('WP_CRON is already disabled!');
		} else {
			gulp.src(buildDir + 'wordpress/wp-config.php')
			.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
			.pipe(gulp.dest(environment.dev + 'wordpress'));
		}
	});
});
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Build Tasks
 * 
 * run "gulp"
 *
 * Adds/Updates the project's theme files in the dev directory:
 *
 *	1. 
 *
 */
/**
 * Task: 'default'
 *
 *	1. Launches the specified default tasks when the user runs the "gulp" or "gulp --verbose" command
 *
 */
gulp.task('default', ['watch']);

/**
 * Task: 'watch'
 *
 *	1. Initiate Browsersync
 *	2. Watch for file changes and run appropriate specific tasks.
 *
 */
gulp.task('watch', function(){
	browserSync.init({
		proxy: environment.proxy,
		//port: 7000, // Use a specific port (instead of the one auto-detected by Browsersync)
		open: 'external',
		//notify: false, // Don't show any notifications in the browser
		//injectChanges: false // Don't try to inject, just do a page refresh
	});
	gulp.watch(style.src + '**/*', ['load-styles']); // stream changes
	gulp.watch(fonts.src + '**/*', ['load-fonts', reload]);
	gulp.watch(img.src + '**', ['load-images']); // stream changes
	gulp.watch(includes.src + '**/*', ['load-includes', reload]);
	gulp.watch(js.src + '**/*', ['load-js', reload]);
	gulp.watch(languages.src + '**/*', ['load-lang', reload]);
	gulp.watch(plugins.src + '**/*', ['load-plugins', reload]);
	gulp.watch(templates.src + '**/*', ['load-templates', reload]);
	gulp.watch(environment.dev + 'wordpress/wp-config*.php', function(event){
		if(event.type === 'added') { 
			gulp.start('disable-cron');
		}
	});
});

/**
 * Task: 'dev'
 *
 *	1. Runs all of the specified 'build tasks', in order
 *
 */
gulp.task('dev', [
	'load-templates',
	'load-includes',
	'load-languages',
	'load-plugins',
	'load-assets',
	'watch'
]);

/**
 * Task: 'load-templates'
 *
 *	1. Loads the project's 'src' files and folders to the 'dev' theme directory
 *
 */
gulp.task('load-templates', function(){
	if (!fs.existsSync(environment.dev)) {
		gutil.log(wpMissing);
		process.exit(1);
	} else {
		gulp.src(templates.src + '**/*')
			.pipe(gulp.dest(templates.dest));
	}
});

/**
 * Task: 'load-includes'
 *
 *	1. Loads the project's 'include' files to the 'dev' theme directory
 *
 */
gulp.task('load-includes', function(){
	gulp.src(includes.src + '**/*')
		.pipe(gulp.dest(includes.dest));
});

/**
 * Task: 'load-languages'
 *
 *	1. Loads the project's 'languages' files to the 'dev' theme directory
 *
 */
gulp.task('load-languages', function(){
	gulp.src(languages.src + '**/*')
		.pipe(gulp.dest(languages.dest));
});

/**
 * Task: 'load-plugins'
 *
 *	1. Loads the project's 'plugins' to the 'dev' install directory
 *
 */
gulp.task('load-plugins', function(){
	gulp.src(plugins.src + '**/*')
		.pipe(gulp.dest(plugins.dest));
});

/**
 * Task: 'load-assets'
 *
 *	1. Runs all of the 'build tasks' related to processing and copying the 
 *	the project's asset files to the 'dev' directory, in order
 *
 */
gulp.task('load-assets', ['load-styles','load-fonts','load-images','load-js']);

/**
 * Task: 'load-styles'
 *
 *	1. Compiles the project's SCSS files to CSS
 *	2. Adds browser prefixes as needed
 *	3. Creates and saves a sourcemap for the CSS
 *	4. Loads the finalized CSS file into the 'dev' build directory
 *
 */
var sassOpts = {
    outputStyle     : 'nested', // expanded
    imagePath       : img.dest,
    precision       : 3,
    errLogToConsole : true,
	indentType		: 'tab',
	indentWidth		: '1'
};
gulp.task('load-styles', function(){
	return gulp.src(style.src + '{style.scss,rtl.scss}')
		.pipe(plumber({ errorHandler: onError }))
		//.pipe(sourcemaps.init())
		.pipe(sass(sassOpts).on('error', sass.logError))
		.pipe(postcss([
			assets({
				loadPaths: [img.src],
      			basePath: environment.dev,
      			baseUrl: themeDest
      		}),
			autoprefixer(AUTOPREFIXER_BROWSERS)
		]))
		//.pipe(sourcemaps.write(style.src + 'maps'))
		.pipe(gulp.dest(style.dest))
		.pipe(browserSync.stream({ match: '**/*.css' }));
});

/**
 * Task: 'load-fonts'
 *
 *	1. Loads the project's font files to the 'dev' directory
 *
 */
gulp.task('load-fonts', function(){
	gulp.src(fonts.src + '**/*')
		.pipe(gulp.dest(fonts.dest));
});

/**
 * Task: 'load-images'
 *
 *	1. Loads the project's image files to the 'dev' directory
 *
 */
gulp.task('load-images', function(){
	gulp.src(img.src + '**/*')
		.pipe(gulp.dest(img.dest));
});

/**
 * Task: 'load-js'
 *
 *	1. Pre-processes the project's JS files
 *	2. Loads the project's compiled JS files to the 'dev' directory
 *
 */
gulp.task('load-js', function(){
	gulp.src(js.src + '**/*')
		.pipe(gulp.dest(js.dest));
});

/**
 * Task: 'compress-images'
 *
 *	1. Checks for and compresses any previously uncompressed project images
 *
 */
//gulp.task('compress-images', () => { // ES6 syntax
gulp.task('compress-images', function() {
  return gulp.src(img.src)
    .pipe(newer(img.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(img.dest));
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
/**
 * @TODO: update/cleanup this stuff... push messages into an array or object
 */
var date = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
var errorMsg = '\x1b[41mHey you!\x1b[0m';
var projectReady = 'Your new WP project is ready. Start the workflow by running this command: $ \x1b[1mgulp\x1b[0m';
var wpMissing = errorMsg + ' Wordpress must be installed first. Run: $ \x1b[1mnpm run install:wordpress\x1b[0m';
var filesGenerated = 'Your ZIP template file was generated in: \x1b[1m' + __dirname + '/dist/' + packageName + '.zip\x1b[0m - ✅';
var pluginsGenerated = 'Plugins are generated in: \x1b[1m' + __dirname + '/dist/plugins/\x1b[0m - ✅';
var backupsGenerated = 'Your backup was generated in: \x1b[1m' + __dirname + '/backups/' + date + '.zip\x1b[0m - ✅';
var wpFy = '\x1b[1mZero2WP\x1b[0m';
var wpFyUrl = '\x1b[2m - https://github.com/arnoldNuvisto/Zero2WP\x1b[0m';
var thanks = 'Thank you for using ' + wpFy + wpFyUrl;

