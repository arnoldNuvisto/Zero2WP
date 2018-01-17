'use strict';
/**
 * gulpfile.js
 *
 * Zero2WP
 *
 * @task "gulp install-wordpress" 
 * @task "gulp install-template"
 * @task "gulp build"
 *
 * @author Arnold Wytenburg (@startupfreak)
 * @version 0.0.5
 */
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING
//var projectName		= 'bootRun';
//var useBootstrap	= true; // 'false | true'
var projectName		= 'testRun';
var useBootstrap	= false; // 'false | true'
// STOP EDITING
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Load Plugins
-------------------------------------------------------------------------------------------------- */
var contains		= require('gulp-contains');
var git 			= require('gulp-git');
var gulp 			= require('gulp');
var gulpif 			= require('gulp-if');
var gutil 			= require('gulp-util');
var del 			= require('del');
var deporder 		= require('gulp-deporder');
var fs 				= require('fs');
var imagemin      	= require('gulp-imagemin');
var inject 			= require('gulp-inject-string');
var lineEndCorrect	= require('gulp-line-ending-corrector');
var newer    		= require('gulp-newer');
var notify	        = require('gulp-notify');
var plumber 		= require('gulp-plumber');
var remoteSrc 		= require('gulp-remote-src');
var rename 			= require('gulp-rename');
var replace 		= require('replace-in-file');
var stripLine  		= require('gulp-strip-line');
var unzip 			= require('gulp-unzip');

// Browsersync related
var browserSync  	= require('browser-sync');
var reload       	= browserSync.reload;

// Javascript related
var concat 			= require('gulp-concat');
var jshint 			= require('gulp-jshint');
var stripDebug 		= require('gulp-strip-debug');
var uglify 			= require('gulp-uglify');

// Style related
var assets 			= require('postcss-assets');
var autoprefixer 	= require('autoprefixer');
var cssnano 		= require('cssnano');
var cssnext 		= require('postcss-cssnext');
var less 			= require('gulp-less');
var partialimport 	= require('postcss-easy-import');
var postcss 		= require('gulp-postcss');
var sass 			= require('gulp-sass');
var sourcemaps 		= require('gulp-sourcemaps');
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Project Constants
-------------------------------------------------------------------------------------------------- */
var _appConfig 		= JSON.parse(fs.readFileSync('./config/app-config.json'));

var _package 		= {
	name 	: projectName.toLowerCase()
};

var _templateSrc 	= {
	uScores : 'https://github.com/Automattic/_s.git',
	bStrap 	: 'https://github.com/arnoldNuvisto/wp_bootstrap.git'
};

var _templateName 	= {
	uScores : '_s',
	bStrap 	: 'wp_bootstrap'
};

if (useBootstrap) {
	var _twbsSrc	= 'node_modules/bootstrap/';
}

var _theme 			= {
	dest 	: 'wordpress/wp-content/themes/' + _package.name + '/' 
};

var _environment	= {
	dev 	: './dev/' + _package.name + '/',
	dist 	: './dist/' + _package.name + '/',
	src 	: './themes/' + _package.name + '/'
};

var _fonts 			= {
	src 	: _environment.src + (useBootstrap ?  _twbsSrc + 'fonts/' : 'fonts/'),
	dest 	: _environment.dev + _theme.dest + 'fonts/'
};

var _img 			= {
	src 	: _environment.src + 'img/' + 'raw/**/*.{png,jpg,gif,svg}',
	dest 	: _environment.dev + _theme.dest + 'img/'
};

var _includes 		= {
	src  	: _environment.src + 'inc/',
	dest 	: _environment.dev + _theme.dest + 'inc/'
};

var _jsEnqueues		= {
	vendorLibs 	: '\n    wp_enqueue_script( \'' + _package.name + '-vendor\', get_template_directory_uri() . \'/js/' + _package.name + '-vendor.js\', array(\'jquery\'), \'\', false );',
	header 		: '\n    wp_enqueue_script( \'' + _package.name + '-header\', get_template_directory_uri() . \'/js/' + _package.name + '-header.js\', array(\'jquery\'), \'\', false );',
	footer 		: '\n    wp_enqueue_script( \'' + _package.name + '-footer\', get_template_directory_uri() . \'/js/' + _package.name + '-footer.js\', array(\'jquery\'), \'\', true );'
};

var _injectEnqueue 	= {
	find 	: _package.name + '_scripts() {',
	replace : _jsEnqueues.vendorLibs + _jsEnqueues.header + _jsEnqueues.footer,
	test 	: 'wp_enqueue_script( \'' + _package.name + '-header\'',
	strip	:
		{
			navScript		: '-navigation\'',
			skipLinkScript 	: '-skip-link-focus-fix\''
		}
};

/**
 * @TODO: if we're using Bootstrap, we ALSO want to process the stuff in twbsSrc
 */
var _js 			= {
//	src 	: _environment.src + (useBootstrap ?  _twbsSrc + 'js/' : 'js/'),
	src 	: _environment.src + 'js/',
	dest 	: _environment.dev + _theme.dest + 'js/'
};

var _jshintOpts 	= {
	undef	: false, // boolean: prohibits the use of explicitly undeclared variables
	unused	: true, // boolean: warns when you define and never use your variables
	browser : true  // boolean: defines globals exposed by modern browsers
};

var _languages 		= {
	src  	: _environment.src + 'languages/',
	dest 	: _environment.dev + _theme.dest + 'languages/'
};

var _pkgRenameOpts 	= {
  files 	: _environment.src + '**/*',
  ignore 	: _environment.src + '*.css',
  from 		: [
	new RegExp("\\b" + (useBootstrap ?  _templateName.bStrap : _templateName.uScores) + "-", "g"),
	new RegExp("\\b " + (useBootstrap ?  _templateName.bStrap : _templateName.uScores), "g"),
	new RegExp("\\b" + (useBootstrap ?  _templateName.bStrap : _templateName.uScores) + "_", "g"),
	new RegExp("\\b" + (useBootstrap ?  _templateName.bStrap : _templateName.uScores), "g")
	],
  to 		: [
  	_package.name + '-', 
  	' ' + _package.name, 
  	_package.name + '_',
  	_package.name
  ]
};

if (useBootstrap) {
	var _targetFiles = [_environment.src + '*.css'];
} else {
	var _targetFiles = [_environment.src + '*.css', _environment.src + '**/*.scss'];
}
var _pkgRenameStyleOpts = {
  files 	: _targetFiles,
  from 		: [
	new RegExp("Theme Name: " + (useBootstrap ?  _templateName.bStrap : _templateName.uScores), "g"),
	new RegExp("Text Domain: " + (useBootstrap ?  _templateName.bStrap : _templateName.uScores), "g")
  ],
  to 		: [
  	'Theme Name: ' + _package.name, 
  	'Text Domain: ' + _package.name
  ]
};

/*
var plugins 		= {
	src 	: _environment.src + 'plugins/', 
	dest 	: _environment.dev + 'wordpress/wp-content/plugins/'
};
*/

/**
 * @TODO: consider adding postcss-assets to the style build
 * see: https://github.com/borodean/postcss-assets
 */
/**
	Legend: Option,	Description, Default
	> basePath, Root directory of the project, "."
	> baseUrl, URL of the project when running the web server, "/"
	> cachebuster, If cache should be busted: Pass a function to define custom busting strategy, "false"
	> loadPaths, Specific directories in which to look for the files, "[]"
	> relative, Directory to relate to when resolving URLs: When true, relates to the input file; When false, disables relative URLs, "false"
	> cache, When true, if the input file not been modifed, use the results before cached, "false"
*/
/**
	var _postcssAssetsOps 	= {
		basePath 		: _environment.dev, // the directory where PostCSS Assets is executed... all URLs and load paths are relative to this
	    baseUrl 		: _theme.dest, // the directory from which the server runs the project
	    cachebuster 	: true,
		loadPaths 		: [
			_img.src,
			_fonts.src
		]
	};
	gulp.task('list', function() {
		gutil.log('loadPaths: ' + _postcssAssetsOps.loadPaths + ' Specific directories in which to look for asset files');
		gutil.log('basePath: ' + _postcssAssetsOps.basePath + ' Root directory of the project');
		gutil.log('baseUrl: ' + _postcssAssetsOps.baseUrl + ' URL of the project when running the web server');
	});
*/
var _sassOpts 		= {
    outputStyle     : 'nested', // (nested | expanded | compact | compressed)
    imagePath       : _img.dest,
    precision       : 10,
    errLogToConsole : true,
	indentType		: 'tab', // (space | tab)
	indentWidth		: '1' // (maximum value: 10)
};

var _server 		= {
	proxy 			: _appConfig.server.host + '/Zero2WP/dev/'  + _package.name + '/wordpress/',
	open 			: 'external', 
	notify 			: _appConfig.server.notify,
	injectChanges	: _appConfig.server.inject
};
if (_appConfig.server.customPort !== null){
	_server.port 	= _appConfig.server.customPort; 
}

var _style 			= {
	src 	: _environment.src + (useBootstrap ?  _twbsSrc + 'less/' : 'sass/'),
	dest 	: _environment.dev + _theme.dest
};
if (useBootstrap) {
	_style.compileReqs 		= '_bootstrap.less';
}

var _template 		= {
	src 	: (useBootstrap ? _templateSrc.bStrap : _templateSrc.uScores)
};

var _themeFiles 	= {
	src 	: _environment.src + '**/*.{php,css,png}',
	dest 	: _environment.dev + _theme.dest 
};

var _translation 	= {
	domain        	: _package.name,
	destFile      	: _package.name + '.pot',
	package       	: _package.name,
	bugReport     	: _appConfig.developer.name + '<' + _appConfig.developer.email + '>',
	lastTranslator	: _appConfig.translator.name + '<' + _appConfig.translator.email + '>',
	team          	: _appConfig.developer.name + '<' + _appConfig.developer.email + '>',
	targetFiles		: _environment.src + '**/*.php'
};

// See https://github.com/ai/browserslist
var _target_browsers = [
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
Project Utilities
-------------------------------------------------------------------------------------------------- */
var _date 				= new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

var _product 			= {
	name 	: 'Zero2WP',
	url 	: ' - https://github.com/arnoldNuvisto/Zero2WP'
};

var	_warning			= '\x1b[41mHey you!\x1b[0m';

var _notices 			= {
	buildMsgs			: {
		load_themeFiles	: 'Loaded theme files to the dev folder for ' + _package.name,
		load_includes	: 'Loaded include files to the dev folder for ' + _package.name,
		load_languages	: 'Loaded language files to the dev folder for ' + _package.name,
		load_plugins	: 'Loaded plugins to the dev folder for ' + _package.name,
		load_styles		: 'Processed, compressed, and loaded CSS files to the dev folder for ' + _package.name,
		load_fonts		: 'Loaded font files to the dev folder for ' + _package.name,
		load_images		: 'Compressed and loaded new images files to the dev folder for ' + _package.name,
		process_head_js	: 'Processed, compressed, and loaded custom header JS files to the dev folder for ' + _package.name,
		process_foot_js	: 'Processed, compressed, and loaded custom footer JS files to the dev folder for ' + _package.name,
		process_libs_js	: 'Processed, compressed, and loaded vendor JS libraries to the dev folder for ' + _package.name,
		update_funcs	: {
			yes			: 'Updated and loaded the functions.php file to the dev folder for ' + _package.name,
			no 			: 'The functions.php file for ' + _package.name + ' is already up to date',
			missing 	: 'The functions.php file for ' + _package.name + ' could not be read'
		},
		disable_cron 	: {
			yes			: 'WP_CRON has been disabled in the wp-config.php file for ' + _package.name,
			no 			: 'WP_CRON was already disabled in the wp-config.php file for ' + _package.name,
			missing 	: 'The wp-config.php file for ' + _package.name + ' could not be read'
		}
	},
	tempInstMsgs		: {
		clone_s			: 'The template has been cloned from Github for ' + _package.name,
		pkg_name_style 	: 'The style files have been reset for ' + _package.name,
		pkg_name_other 	: 'The package files have been reset for ' + _package.name
	},
	wpInstMsgs			: {
		download 		: 'WP has been downloaded into the dev folder for ' + _package.name,
		missing 		: _warning + 'Wordpress needs to be installed first',
		ready 			: 'A new WP project is ready for ' + _package.name,
		thx				: 'Thanks for using ' + _product.name + ' ' + _product.url,
		unzip 			: 'WP has been unzipped into the dev folder for ' + _package.name
	}
};

/**
 * @var 'onError'
 * 
 * Defines the default error handler passed to 'plumber'
 *
 * See: https://scotch.io/tutorials/prevent-errors-from-crashing-gulp-watch
 */
var onError 			= function (err) {
    notify.onError({
        title: _product.name +  ' - ' + "Gulp error in " + err.plugin,
        message:  err.toString()
    })(err);
	gutil.beep();
	gutil.log(_product.name + ' - ' + _warning + ' ' + err.toString());
	this.emit('end');
};
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Wordpress Installation
 * 
 * run "gulp install-wordpress"
 *
 * Installs a fresh copy of the Wordpress source files into a project-specific dev subfolder
 *
 * Tasks:
 * - install-wordpress (the main task runner)
 * - cleanup-dev
 * - download-wordpress
 * - unzip-wordpress
 * - copy-config
 * - cleanup-install
 * - disable-cron
 *
 */
/**
 * @task: 'install-wordpress'
 *
 *	1. Removes any remaining folders and files from previous installs for this project
 * 	2. Downloads a fresh Wordpress zip file from Wordpress.org
 * 	3. Unzips the downloaded file and installs it to the project's dev directory
 *	2. Copies over a default 'wp-config.php' file, if one exists
 * 	3. Deletes the downloaded zip file
 *
 */
gulp.task('install-wordpress', [
	'cleanup-dev', 
	'download-wordpress', 
	'unzip-wordpress', 
	'copy-config',
	'cleanup-install'
	]
);

/**
 * @task: 'cleanup-dev'
 *
 *	1. Empties a pre-exisiting 'dev' folder, if present
 *	2. Empties a pre-exisiting 'dist' folder, if present
 *
 */
gulp.task('cleanup-dev', function (cb) {
	del([_environment.dev + '**/*']);
	return del([_environment.dist + '**/*']);
});

/**
 * @task: 'download-wordpress'
 *
 *	1. Retrieves a zip file containing the most recent version of Wordpress from wordpress.org
 *	2. Places the zip file into the 'dev' folder for installation
 *
 */
gulp.task('download-wordpress', ['cleanup-dev'], function (cb) {
	return remoteSrc( ['latest.zip'], { base: 'https://wordpress.org/' } )
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_environment.dev))
    	.pipe(notify({message: _notices.wpInstMsgs.download, title: _product.name, onLast: true }));
});

/**
 * @task: 'unzip-wordpress'.
 *
 *	1. Unzips the downloaded file
 *	2. Places the unzipped Wordpress files into the project's dev' folder
 *
 */
gulp.task('unzip-wordpress', ['download-wordpress'], function (cb) {
	return gulp.src(_environment.dev + 'latest.zip')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(unzip())
		.pipe(gulp.dest(_environment.dev))
    	.pipe(notify({message: _notices.wpInstMsgs.unzip, title: _product.name, onLast: true }));
});

/**
 * @task: 'copy-config'.
 *
 *	1. If a default config file exists:
 		1.1 Updates the file to disable 'cron'
 *		1.2 Places the file into the 'dev' folder
 *	3. Notifies the user that the install is completed
 *
 */
gulp.task('copy-config', ['unzip-wordpress'], function () {
	gulp.src('wp-config.php')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
		.pipe(gulp.dest(_environment.dev + 'wordpress'))
		.on('end', function () {
				gutil.beep();
				gutil.log(_product.name + ' ' + _notices.wpInstMsgs.ready);
				gutil.log(_product.name + ' ' + _notices.wpInstMsgs.thx);
			});
});

/**
 * @task: 'cleanup-install'
 *
 *	1. Removes the downloaded zip file
 *
 */
gulp.task('cleanup-install', ['unzip-wordpress'], function () {
	return del([_environment.dev + 'latest.zip']);
});

/**
 * @task: 'disable-cron'.
 *
 *	1. Checks the 'wp-config.php' file
 *	2. Disables 'cron' if not already disabled
 *
 */
gulp.task('disable-cron', function () {
	fs.readFile(_environment.dev + 'wordpress/wp-config.php', function (err, data) {
		if (err) {
			gutil.log(_product.name + ' - ' + _notices.buildMsgs.disable_cron.missing);
			process.exit(1);
		}
		if (data.indexOf('DISABLE_WP_CRON') >= 0){
			gutil.log(_product.name + ' - ' + _notices.buildMsgs.disable_cron.no);
		} 
		else {
			gulp.src(_environment.dev + 'wordpress/wp-config.php')
			.pipe(plumber({ errorHandler: onError }))
			.pipe(inject.after('define(\'DB_COLLATE\', \'\');', '\ndefine(\'DISABLE_WP_CRON\', true);'))
			.pipe(gulp.dest(_environment.dev + 'wordpress'))
    		.pipe(notify({message: _notices.buildMsgs.disable_cron.yes, title: _product.name, onLast: true }));
		}
	});
});

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Template Installation
 * 
 * run "gulp install-template"
 *
 * Installs a fresh copy of the '_s' template source files into a project-specific theme subfolder
 *
 * - install-template (the main task runner)
 * - clone_s
 * - replace-package-name-style
 * - replace-package-name
 * - cleanup-template-files
 *
 */
/**
 * @FUTURE: Allow for custom theme repos based on: a) _s structure; b) custom structure
 *
 * This will require setting up individual config files for each project so that users
 * can keep their various projects separated from each other
 *
 * See: http://www.drinchev.com/blog/let-s-scale-that-gulpfile-js/
 * See: https://stackoverflow.com/questions/23903551/how-to-import-or-include-a-javascript-file-in-a-gulp-file
 * See: https://medium.com/@_jh3y/how-to-parsing-a-config-file-for-custom-builds-with-gulp-js-3af364ffea30
 *
 * @NOTE: the following bit will prove useful for downloading from a different URL
 * run "gulp mytask --repo <repo-url-here>" to use a custom repo
 * run "gulp mytask" to use the default _s repo
 *
 * See: https://stackoverflow.com/questions/28538918/pass-parameter-to-gulp-task
 */
/*
	var repo, i = process.argv.indexOf("--repo"); // gets the index of the argument we're after
	gulp.task('mytask', function() {
		if(i>-1) { // if an index was found, get the URL for custom repo which was passed as an arg
		    repo = process.argv[i+1];
		    console.log(repo);
		} 
		else {// else use the standard _s repo
		}
	});
*/
/**
 * @task: 'install-template'
 *
 *	1. Clones the underscores template from GitHub
 *	2. Updates the template name in the .css and .scss files
 *	3. Updates the template name in the remaining files
 *
 */
gulp.task('install-template', [
	'clone_s', 
	'replace-package-name-style', 
	'replace-package-name', 
	'cleanup-template-files'
	]
);

/**
 * @task: 'clone_s'
 *
 *	1. Clones the '_s' template into a project-specific theme subfolder 
 *
 */
gulp.task('clone_s', function(cb){
	return git.clone(_template.src, {args: _environment.src}, function (err) {
		cb(err);
		gutil.log(_product.name + ' - ' + _notices.tempInstMsgs.clone_s);
	});
});

/**
 * @task: 'replace-package-name-style'
 *
 *	1. Replaces '_s' with the packageName in the project's '.css' and '.scss' files
 *
 */
gulp.task('replace-package-name-style', ['clone_s'], function() {
	return replace(_pkgRenameStyleOpts, function(error, changes) {
		if (error) {
	    	console.error('Error occurred:', error); 
	  	} else {
			gutil.log(_product.name + ' - ' + _notices.tempInstMsgs.pkg_name_style);
	  		//console.log('Modified files:', changes.join(', ')); 
		}
	});
});

/**
 * @task: 'replace-package-name'
 *
 *	1. Replaces '_s' with the packageName in the project's remaining files
 *
 */
gulp.task('replace-package-name', ['clone_s'], function() {
	return replace(_pkgRenameOpts, function(error, changes) {
		if (error) {
			console.error('Error occurred:', error); 
	  	} else {
			gutil.log(_product.name + ' - ' + _notices.tempInstMsgs.pkg_name_other);
		  	//console.log('Modified files:', changes.join(', ')); 
	  	}
	});
});

/**
 * @task: 'cleanup-template-files'
 *
 *	1. Removes the legacy '.github' folder from the template
 *
 */
gulp.task('cleanup-template-files', ['clone_s'], function () {
	return del([_environment.src + '.github']);
});

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
 * Build Tasks
 * 
 * run "gulp build" for an initial build
 * run "gulp" after initial build
 *
 * Adds/Updates the project's theme files in the project's dev directory:
 * 
 * Tasks:
 * - build (the main task runner)
 * - load-themeFiles
 * - load-includes
 * - load-languages
 * - load-assets (a sub-task runner)
 * - load-styles
 * - load-fonts
 * - load-images
 * - compress-images
 * - load-js (a sub-task runner)
 * - process-js
 * - update-funcs
 * - default (s sub-task runner)
 * - watch
 *
 */
/**
 * @task: 'build'
 *
 *	1. Runs all of the specified 'build tasks'
 *
 */
gulp.task('build', [
	'load-themeFiles',
	'load-includes',
	'load-languages',
	'load-assets',
	'watch'
]);

/**
 * @task: 'load-themeFiles'
 *
 *	1. Loads the project's template/theme files and folders to the project's dev directory
 *
 */
gulp.task('load-themeFiles', function(){
	if (!fs.existsSync(_environment.dev)) {
		gutil.log(_product.name + ' - ' + _warning + ' - ' + _notices.wpInstMsgs.missing);
		process.exit(1);
	} else {
		return gulp.src(_themeFiles.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(gulp.dest(_themeFiles.dest))
    		.pipe(notify({ message: _notices.buildMsgs.load_themeFiles, title: _product.name, onLast: true}));
	}
});

/**
 * @task: 'load-includes'
 *
 *	1. Loads the project's include files and folders to the project's dev directory
 *
 */
gulp.task('load-includes', function(){
	return gulp.src(_includes.src + '**/*')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_includes.dest))
   		.pipe(notify({message: _notices.buildMsgs.load_includes, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-languages'
 *
 *	1. Loads the project's languages files and folders to the project's dev directory
 *
 */
gulp.task('load-languages', function(){
	return gulp.src(_languages.src + '**/*')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_languages.dest))
    	.pipe(notify({ message: _notices.buildMsgs.load_languages, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-plugins'
 *
 *	1. Loads the project's 'plugins' to the project build's install directory
 *
 */
//gulp.task('load-plugins', function(){
//	gulp.src(plugins.src + '**/*'//)
//		.pipe(plumber({ errorHandler: onError }))
//		.pipe(gulp.dest(plugins.dest))
//    	.pipe(notify({ message: _notices.buildMsgs.load_plugins, title: _product.name, onLast: true}));
//});

/**
 * @task: 'load-assets'
 *
 *	1. Runs all of the 'build tasks' related to processing and copying the 
 *	the project's asset files to the project build's directory
 *
 */
gulp.task('load-assets', [
	'load-styles',
	'load-fonts',
	'load-images',
	'load-js'
	]
);

/**
 * @task: 'load-styles'
 *
 *	1. Compiles the project's SCSS files to CSS
 *	2. Adds browser prefixes as needed
 *	3. Creates and saves a sourcemap within the css file to assist with debugging
 * 	4. Corrects line endings as needed
 * 	5. Loads the finalized CSS file into the project's build directory
 * 	6. Streams changes to the browser
 * 	7. Posts a notice to confirm that css processing is complete
 *
 */
/**
 * See: https://www.sitepoint.com/postcss-mythbusting/
 * : look into adding: https://github.com/SlexAxton/css-colorguard
 * : look into adding: https://stylelint.io/
 * : look into adding: https://github.com/borodean/postcss-assets
 * ... 	
	assets({
		loadPaths: _postcssAssetsOps.loadPaths,
			basePath: _postcssAssetsOps.basePath,
			baseUrl: _postcssAssetsOps.baseUrl
	}),
 *
 */
gulp.task('load-styles', ['load-images'], function(){
	return gulp.src(_style.src + (useBootstrap ? _style.compileReqs : '{style.scss,rtl.scss}'))
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sourcemaps.init())
		.pipe( ( useBootstrap ? less() : sass(_sassOpts).on('error', sass.logError) ) )
		.pipe(postcss([
			autoprefixer(_target_browsers)
		]))
		.pipe(sourcemaps.write())
	    .pipe(lineEndCorrect())
		.pipe(gulp.dest(_style.dest))
		.pipe(browserSync.stream({ match: '**/*.css' }))
    	.pipe(notify({message: _notices.buildMsgs.load_styles, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-fonts'
 *
 *	1. Loads the project's font files and folders to the project's dev directory
 *
 */
gulp.task('load-fonts', function(){
	return gulp.src(_fonts.src + '**/*')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_fonts.dest))
    	.pipe(notify({ message: _notices.buildMsgs.load_fonts, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-images'
 *
 *	1. Loads the project's compressed image files and folders to the project's dev directory
 *
 */
gulp.task('load-images', ['compress-images'], function(){
	return gulp.src([
      _img.src + '**/*',
      '!' + _img.src + '/**/raw/'
    ])
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_img.dest))
    	.pipe(notify({message: _notices.buildMsgs.load_images, title: _product.name, onLast: true}));
});

/**
 * @task: compress-images
 *
 * Minifies PNG, JPEG, GIF and SVG images:
 *
 *	1. Checks for and compresses any previously uncompressed project images
 *	2. Adds these to the theme's main image folder 
 *
 */
gulp.task('compress-images', function() {
  return gulp.src(_img.src + 'raw/**/*.{png,jpg,gif,svg}')
	.pipe(plumber({ errorHandler: onError }))
    .pipe(newer(_img.src)) // @TODO: this may be a problem... will this include the contents of /raw?
    .pipe(imagemin([
	    imagemin.gifsicle({interlaced: true}),
	    imagemin.jpegtran({progressive: true}),
	    imagemin.optipng({optimizationLevel: 5}), // 0-7 low-high
	    imagemin.svgo({
	        plugins: [
	            {removeViewBox: true},
	            {cleanupIDs: false}
	        ]
    	})
	]))
    .pipe(gulp.dest(_img.src));
});

/**
 * @task: 'load-js'
 *
 *	1. Copies the project's JS files to the project build's theme directory
 *
 */
gulp.task('load-js', ['load-vendor-libs-js', 'load-custom-js', 'update-funcs']);

gulp.task('load-custom-js', ['process-header-js', 'process-footer-js']);

/**
 * @task: 'process-header-js'
 *
 * This task processes 'themes/<project-name>/js/*.js'. Normally, these
 * will be custom files, so source hinting is performed
 * 
 * 	1. Order the JS source files in dependency order
 * 	2. Concat these into a single file
 * 	3. Write a sourcemap to the file
 *	4. Correct line endings for non-unix systems
 *	5. Save the final file into the project's dev folder
 *
 */
gulp.task('process-header-js', function() {
	return gulp.src([_js.src + '*.js'])
		.pipe(plumber({ errorHandler: onError }))
	    .pipe(jshint(_jshintOpts))
	    .pipe(jshint.reporter('default'))
		.pipe(sourcemaps.init())
	    .pipe(deporder())
	    .pipe(concat(_package.name + '-header.js'))
		.pipe(sourcemaps.write())
	    .pipe(lineEndCorrect())
	    .pipe(gulp.dest(_js.dest))
    	.pipe(notify({message: _notices.buildMsgs.process_head_js, title: _product.name, onLast: true}));
});

/**
 * @task: 'process-footer-js'
 *
 * This task processes 'themes/<project-name>/js/footer/*.js'. Normally, these
 * will be custom files, so source hinting is performed
 *
 *	1. Runs JSHint to look for errors, reports these and halts the run when found
 * 	2. Order the JS source files in dependency order
 * 	3. Contact the JS files into a single file
 * 	4. Minify the resulting file
 * 	5. Write a sourcemap to the file
 *	6. Correct line endings for non-unix systems
 *	7. Save the final file into the project's dev folder
 *
 */
gulp.task('process-footer-js', function() {
	return gulp.src([_js.src + 'footer/*.js'])
		.pipe(plumber({ errorHandler: onError }))
	    .pipe(jshint(_jshintOpts))
	    .pipe(jshint.reporter('default'))
		.pipe(sourcemaps.init())
	    .pipe(deporder())
	    .pipe(concat(_package.name + '-footer.js'))
		.pipe(sourcemaps.write())
	    .pipe(lineEndCorrect())
	    .pipe(gulp.dest(_js.dest))
    	.pipe(notify({message: _notices.buildMsgs.process_foot_js, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-vendor-libs-js'
 *
 * This task processes 'themes/<project-name>/js/vendor/**' + ' /*.js'. 
 * 
 * 	1. Check to see if there any new or updated vendor JS files
 * 	2. If so, uglify any files that are not already minified
 * 	3. Rename these files to include the '.min' extension
 *	4. Concat all files into a single file
 * 	5. Correct line endings for non-unix systems
 *	6. Save the final file into the project's dev folder
 *
 * Note:  newer() passes through all files if any one file in src
 * has been modified more recently than the concatenated dest file
 *
 */
/**
 * @TODO: if(useBootstrap) bootstrap files also need to be included
 */
gulp.task('load-vendor-libs-js', function() {
	return gulp.src([_js.src + 'vendor/**/*.js'])
		.pipe(plumber({ errorHandler: onError }))
	    .pipe(newer(_js.dest + _package.name + '-vendor.js'))
        .pipe(gulpif(["*.js", "!*.min.js"],
            uglify()
        ))
        .pipe(gulpif(["*.js", "!*.min.js"],
            rename({suffix: ".min"})
		))
	    .pipe(concat(_package.name + '-vendor.js'))
	    .pipe(lineEndCorrect())
	    .pipe(gulp.dest(_js.dest))
    	.pipe(notify({message: _notices.buildMsgs.process_libs_js, title: _product.name, onLast: true}));
});

/**
 * @task: 'update-functions-file'
 *
 *	1. Tests the function file to see if it already enqueues the processed JS files
 * 	2. If not already up to date:
 * 		2.1 Injects code to enqueue the new JS files
 * 		2.2 Removes any default code leftover from the initial template install which enqueues unused JS files
 * 		2.3 Saves the updated functions.php file to the project's dev and theme folders
 *
 */

gulp.task('update-funcs', ['load-custom-js', 'load-vendor-libs-js'], function () {
	fs.readFile(_environment.src + 'functions.php', function (err, data) {
		if (err) {
			return gutil.log(_product.name + ' - ' + _warning + ' - ' + _notices.buildMsgs.update_funcs.missing);
		}
		if (data.indexOf(_injectEnqueue.test) >= 0) {
			return gutil.log(_product.name + ' - ' + _notices.buildMsgs.update_funcs.no);
		} 
		else {
			return gulp.src([_environment.src + 'functions.php'])
			.pipe(plumber({ errorHandler: onError }))
			.pipe(inject.after(_injectEnqueue.find, _injectEnqueue.replace ))
			.pipe(stripLine([_injectEnqueue.strip.navScript, 'use strict']))
			.pipe(stripLine([_injectEnqueue.strip.skipLinkScript, 'use strict']))
		    .pipe(gulp.dest(_environment.src))
		    .pipe(gulp.dest(_environment.dev + _theme.dest))
	    	.pipe(notify({message: _notices.buildMsgs.update_funcs.yes, title: _product.name, onLast: true}));
		}
	});
});

/**
 * @task: 'watch'
 *
 *	1. Initiate Browsersync
 *	2. Watch for file changes and run appropriate build tasks
 *
 */
gulp.task('watch', function(){ 
	browserSync.init(_server);

	gulp.watch(_style.src + '**/*', ['load-styles']);
	gulp.watch(_fonts.src + '**/*', ['load-fonts', reload]);
	gulp.watch(_img.src + '**', ['load-images', reload]);
	gulp.watch(_includes.src + '**/*', ['load-includes', reload]);
	gulp.watch(_js.src + '**/*', ['load-js', reload]);
	gulp.watch(_languages.src + '**/*', ['load-lang', reload]);
	//gulp.watch(plugins.src + '**/*', ['load-plugins', reload]);
	gulp.watch(_themeFiles.src, ['load-themeFiles', reload]);
	
	gulp.watch(_environment.dev + 'wordpress/wp-config*.php', function(event){
		if(event.type === 'added') { 
			gulp.start('disable-cron');
		}
	});
});

/**
 * @task: 'default'
 *
 *	1. Launches the 'watch' task when the user runs the "gulp" or "gulp --verbose" command
 *
 */
gulp.task('default', ['watch']);

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Distribution Tasks
-------------------------------------------------------------------------------------------------- */
/**
 * @TODO: 
 * > https://www.npmjs.com/package/gulp-strip-debug/
 * > https://www.npmjs.com/package/gulp-gzip
 * > do not include sourcemaps in css or js
 */

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Translation Tasks
-------------------------------------------------------------------------------------------------- */
/**
 * @TODO: Figure out a strategy for handling i18n & l10n
 */
/**
 * WP POT Translation File Generator:
 *
 *     1. Gets the source of all the PHP files
 *     2. Sort files in stream by path or any custom sort comparator
 *     3. Applies wpPot with the variable set at the top of this file
 *     4. Generate a .pot file of i18n that can be used for l10n to build .mo file
 *
 */
/*
 gulp.task( 'translate', function () {
     return gulp.src( _translation.targetFiles )
         .pipe(sort())
         .pipe(wpPot( {
             domain        : _translation.domain,
             destFile      : _translation.destFile,
             package       : _translation.package,
             bugReport     : _translation.bugReport,
             lastTranslator: _translation.lastTranslator,
             team          : _translation.team
         } ))
        .pipe(gulp.dest(_languages.src));
 });
*/
