'use strict';
/**
 * gulpfile.js
 *
 * Zero2WP
 *
 * @task "gulp install-wordpress" 
 * @task "gulp install-template"
 * @task "gulp build"
 * @task "gulp"
 *
 * @author Arnold Wytenburg (@startupfreak)
 * @version 0.0.10
 */
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// BEFORE YOU START
/**
 * 1) Open 'project-config.json', add a new entry for your project, and save the file. 
 * 2) Next, copy the project's name below EXACTLY as it appears in 'project-config.json'
 * 3) You're good to go!
 */
// START EDITING
var projectName			= "Andiron"; // REQD // Upper & lowercase letters & numbers only
// STOP EDITING
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Load Plugins
-------------------------------------------------------------------------------------------------- */
// General utilities
var contains		= require('gulp-contains');
var git 			= require('gulp-git');
var gulp 			= require('gulp');
var gulpif 			= require('gulp-if');
var gutil 			= require('gulp-util');
var del 			= require('del');
var fs 				= require('graceful-fs');
var header 			= require('gulp-header');
var inject 			= require('gulp-inject-string');
var lineEndCorrect	= require('gulp-line-ending-corrector');
var newer    		= require('gulp-newer');
var notify	        = require('gulp-notify');
var plumber 		= require('gulp-plumber');
var remoteSrc 		= require('gulp-remote-src');
var removeLine 		= require('gulp-remove-line');
var rename 			= require('gulp-rename');
var replace 		= require('replace-in-file');
var stripLine  		= require('gulp-strip-line');
var unzip 			= require('gulp-unzip');
var browserSync  	= require('browser-sync');
var reload       	= browserSync.reload;

// Javascript and Style related
var assets 			= require('postcss-assets');
var autoprefixer 	= require('autoprefixer');
var concat 			= require('gulp-concat');
var cssnano 		= require('cssnano');
var cssnext 		= require('postcss-cssnext');
var deporder 		= require('gulp-deporder');
var jshint 			= require('gulp-jshint');
var less 			= require('gulp-less');
var partialimport 	= require('postcss-easy-import');
var postcss 		= require('gulp-postcss');
var sass 			= require('gulp-sass');
var sourcemaps 		= require('gulp-sourcemaps');
var stripDebug 		= require('gulp-strip-debug');
var uglify 			= require('gulp-uglify');

// Media related
var imagemin      	= require('gulp-imagemin');

//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Project Constants
-------------------------------------------------------------------------------------------------- */
var _appConfig 		= JSON.parse(fs.readFileSync('./config/app-config.json'));

var _projConfig 	= JSON.parse(fs.readFileSync('./config/project-config.json'));

var _project 		= _projConfig[projectName];

var _package 		= {
	title 			: projectName,
	name 			: projectName.toLowerCase()
};

var _useBootstrap = _project.useBootstrap;

var _bootstrap 		= {
	srcURI 	: 'https://github.com/twbs/bootstrap/archive/',
	srcFile	: ['v3.3.7.zip']
};
/**
 * @NOTE: This loads up a version of '_s' that was forked on Feb 4, 2018
 */
var _template 		= {
	src 	: 'https://github.com/arnoldNuvisto/_s.git',
	name 	: '_s'
};

var _theme 			= {
	dest 	: 'wordpress/wp-content/themes/' + _package.name + '/' 
};

var _environment	= {
	dev 	: './dev/' + _package.name + '/',
	dist 	: './dist/' + _package.name + '/',
	src 	: './themes/' + _package.name + '/'
};

var _enqueues		= {
	scripts : {
		libs	: '\n\n    wp_enqueue_script( \'' + _package.name + '-libs\', get_template_directory_uri() . \'/assets/js/' + _package.name + '-libs.js\', array(\'jquery\'), \'\', false );',
		header 	: '\n\n    wp_enqueue_script( \'' + _package.name + '-header\', get_template_directory_uri() . \'/assets/js/' + _package.name + '-header.js\', array(\'jquery\'), \'\', false );',
		footer 	: '\n\n    wp_enqueue_script( \'' + _package.name + '-footer\', get_template_directory_uri() . \'/assets/js/' + _package.name + '-footer.js\', array(\'jquery\'), \'\', true );'
	},
	styles 	: {
		theme 	: '\n\n    wp_enqueue_style( \'' + _package.name + '-theme-style\', get_template_directory_uri() . \'/assets/css/' + _package.name + '-theme-style.css\', array(), false, \'all\' );',
	}
};

var _injectEnqueues	= {
	find 	: 'wp_enqueue_style( \'' + _package.title + '-style\', get_stylesheet_uri() );',
	insert  : _enqueues.styles.theme + _enqueues.scripts.libs + _enqueues.scripts.header + _enqueues.scripts.footer,
	test 	: 'wp_enqueue_style( \'' + _package.name + '-theme-style\'',
	strip	:
		{
			navScript		: '-navigation\'',
			skipLinkScript 	: '-skip-link-focus-fix\''
		}
};

var _fonts 			= {
	src 	: _environment.src + 'fonts/',
	dest 	: _environment.dev + _theme.dest + 'assets/fonts/'
};

var _fontPathRenameOpts 	= {
  files 	: _environment.src + 'bootstrap/less/variables.less',
  from 		: [ new RegExp("..\/fonts\/", "g") ],
  to 		: [ "../assets/fonts/" ]
};

var _img 			= {
	src 	: _environment.src + 'img/' + 'raw/**/*.{png,jpg,gif,svg}',
	dest 	: _environment.dev + _theme.dest + 'assets/img/'
};

var _includes 		= {
	src  	: _environment.src + 'inc/',
	dest 	: _environment.dev + _theme.dest + 'inc/'
};

var _js 			= {
	src 	: _environment.src + 'js/',
	dest 	: _environment.dev + _theme.dest + 'assets/js/'
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
  from 		: [
	new RegExp("\\b" + _template.name + "-", "g"),
	new RegExp("\\b " + _template.name, "g"),
	new RegExp("\\b" + _template.name + "_", "g"),
	new RegExp("\\b" + _template.name, "g")
	],
  to 		: [
  	_package.title + '-', 
  	' ' + _package.title, 
  	_package.title + '_',
  	_package.title
  ]
};

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
	src 	: _environment.src + (_useBootstrap ?  'bootstrap/less/' : 'sass/'),
	srcLibs : _environment.src + 'css/',
	dest 	: _environment.dev + _theme.dest + 'assets/css/'
};
if (_useBootstrap) {
	_style.compileReqs 		= '_bootstrap.less';
}

var _styleBanner 	= [
	"/*!",
	"Theme Name: "	+ _package.title,
	"Theme URI: "	+ (_project.URI ? _project.URI : ""),// fyi, can be 'false'
	"Author: "		+ _appConfig.developer.name,
	"Author URI: "	+ _appConfig.developer.url,
	"Description: "	+ _project.description,
	"Version: "		+ _project.version,
	"License: "		+ _project.license,
	"License URI: "	+ _project.licenseURI,
	"Text Domain: "	+ _package.name,
	"Tags: ",
	"*/\n"
];

/**
 * @TODO: figure out how to NOT copy over './css/**'
 */
var _themeFiles 	= {
	src 	: _environment.src + ['**/*.{php,css,png}'],
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
App Utilities
-------------------------------------------------------------------------------------------------- */
var _date 				= new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

var _product 			= {
	name 	: 'Zero2WP',
	url 	: ' - https://github.com/arnoldNuvisto/Zero2WP'
};

var	_warning			= '\x1b[41mHey you!\x1b[0m';

var _notices 			= {
	buildMsgs			: {
		load_themeFiles	: 'Loaded theme files to the dev folder for ' + _package.title,
		load_includes	: 'Loaded include files to the dev folder for ' + _package.title,
		load_languages	: 'Loaded language files to the dev folder for ' + _package.title,
		load_plugins	: 'Loaded plugins to the dev folder for ' + _package.title,
		load_styles		: 'Processed, compressed, and loaded CSS files to the dev folder for ' + _package.title,
		load_style_libs	: 'Compressed and loaded vendor CSS files to the dev folder for ' + _package.title,
		load_fonts		: 'Loaded font files to the dev folder for ' + _package.title,
		load_images		: 'Compressed and loaded new images files to the dev folder for ' + _package.title,
		process_head_js	: 'Processed, compressed, and loaded custom header JS files to the dev folder for ' + _package.title,
		process_foot_js	: 'Processed, compressed, and loaded custom footer JS files to the dev folder for ' + _package.title,
		process_libs_js	: 'Processed, compressed, and loaded vendor JS libraries to the dev folder for ' + _package.title,
		update_enqueues	: {
			missing 	: 'The functions.php file for ' + _package.title + ' could not be read',
			ok 			: 'The enqueues for ' + _package.title + ' are already up to date',
			updated 	: 'The enqueues for ' + _package.title + ' have been updated'
		},
		disable_cron 	: {
			yes			: 'WP_CRON has been disabled in the wp-config.php file for ' + _package.title,
			no 			: 'WP_CRON was already disabled in the wp-config.php file for ' + _package.title,
			missing 	: 'The wp-config.php file for ' + _package.title + ' could not be read'
		}
	},
	tempInstMsgs		: {
		clone_repo		: 'The template has been cloned from Github for ' + _package.title,
		pkg_name_style 	: 'The style files have been reset for ' + _package.title,
		pkg_name_other 	: 'The package files have been reset for ' + _package.title
	},
	bsInstMsgs			: {
		download 		: 'Bootstrap has been downloaded into the theme folder for ' + _package.title,
		missing 		: _warning + 'Underscores needs to be installed first',
		unzip 			: 'Bootstrap has been unzipped into the theme folder for ' + _package.title
	},
	wpInstMsgs			: {
		download 		: 'WP has been downloaded into the dev folder for ' + _package.title,
		missing 		: _warning + 'Wordpress needs to be installed first',
		ready 			: 'A new WP project is ready for ' + _package.title,
		thx				: 'Thanks for using ' + _product.name + ' ' + _product.url,
		unzip 			: 'WP has been unzipped into the dev folder for ' + _package.title
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
 *	1. Empties a pre-existing 'dev' folder for this project, if present
 *	2. Empties a pre-existing 'dist' folder for this project, if present
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
 *	1. Removes the leftover downloaded zip file
 *
 */
gulp.task('cleanup-install', ['unzip-wordpress'], function () {
	return del([ _environment.dev + 'latest.zip'	]
	);
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
 * - clone-repo
 * - install-bootstrap (sub-task runner)
 * - download-bootstrap 
 * - unzip-bootstrap
 * - cleanup-bootstrap
 * - update-style-banner (sub-task runner)
 * - update-css-banner
 * - clear-scss-banner
 * - replace-package-name
 * - cleanup-template-files
 *
 */
/**
 * @task: 'install-template'
 *
 *	1. Clones the specified template from GitHub
 * 	2. Initiates optional bootstrap installation
 *	3. Initiates update of the theme's banner in 'style.css' and 'sass/style.scss'
 *	4. Updates the template name in the theme's remaining files
 * 	5. Deletes the downloaded theme's default '.github' file
 *
 */
gulp.task('install-template', [
	'clone-repo', 
	'install-bootstrap',
	'update-style-banner', 
	'replace-package-name', 
	'cleanup-template-files'
	]
);

/**
 * @task: 'clone-repo'
 *
 *	1. Clones the specified into a project-specific theme subfolder 
 *
 */
gulp.task('clone-repo', function(cb){
	return git.clone(_template.src, {args: _environment.src}, function (err) {
		cb(err);
		gutil.log(_product.name + ' - ' + _notices.tempInstMsgs.clone_repo);
	});
});

/**
 * @task: 'install-bootstrap'
 *
 *	1. Runs 'download-bootstrap', 'unzip-bootstrap' & 'cleanup-bootstrap' tasks
 *
 */
gulp.task('install-bootstrap', ['download-bootstrap', 'unzip-bootstrap', 'init-bootstrap'] );

/**
 * @task: 'download-bootstrap'
 *
 *	1. Optionally retrieves a zip file containing version 3.3.7 of Bootstrap from Github
 *	2. Places the zip file into the project's 'theme' folder for installation
 *
 */
gulp.task('download-bootstrap', ['clone-repo'], function ( ) {
	if (_useBootstrap) {
		return remoteSrc( _bootstrap.srcFile, { base: _bootstrap.srcURI } )
		.pipe(plumber({ errorHandler: onError }))
		.pipe(gulp.dest(_environment.src))
    	.pipe(notify({message: _notices.bsInstMsgs.download, title: _product.name, onLast: true }));
    } else { 
    	return;
    }
});

/**
 * @task: 'unzip-bootstrap'.
 *
 *	1. Unzips the optionally downloaded file
 *	2. Places the unzipped Bootstrap files into the project's 'theme' folder
 *
 */
gulp.task('unzip-bootstrap', ['download-bootstrap'], function ( ) {
	if (_useBootstrap) {
		return gulp.src(_environment.src + 'v3.3.7.zip')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(unzip())
		.pipe(gulp.dest(_environment.src))
    	.pipe(notify({message: _notices.bsInstMsgs.unzip, title: _product.name, onLast: true }));
    } else { 
    	return;
    }
});

/**
 * @task: 'cleanup-bootstrap'.
 *
 *	1. Renames the Bootstrap folder
 * 	2. Removes unecessary bootstrap files & folders
 * 	3. Removes the sass folder
 * 	4. Deletes the downloaded zip file
 * 	5. Renames 'bootstrap.less' to '_bootstrap.less'
 *
 */
gulp.task('init-bootstrap', ['unzip-bootstrap'], function( ) {
	if (_useBootstrap) {
		fs.rename(_environment.src + 'bootstrap-3.3.7', _environment.src + 'bootstrap', function (err) {
			if (err) {
				throw err;
			} else {
				//console.log('source.txt was copied to destination.txt');
				fs.copyFile(_environment.src + 'bootstrap/dist/js/bootstrap.js', _environment.src + 'js/bootstrap.js', function (err) {
					if (err) throw err;
					//console.log('source.txt was copied to destination.txt');
				});
				fs.rename(_environment.src + 'bootstrap/fonts', _environment.src + 'fonts/', function (err) {
					if (err) throw err;
					//console.log('source.txt was copied to destination.txt');
				});
				replace(_fontPathRenameOpts, function(err, changes) {
					if (err) throw err;
				});
				fs.rename(_environment.src + 'bootstrap/less/bootstrap.less', _environment.src + 'bootstrap/less/_bootstrap.less', function (err) {
					if (err) throw err;
					//console.log('source.txt was copied to destination.txt');
				});
				del([
					_environment.src + 'bootstrap/dist/**',
					_environment.src + 'bootstrap/docs/**',
					_environment.src + 'bootstrap/grunt/**',
					_environment.src + 'bootstrap/nuget/**',
					_environment.src + 'bootstrap/js/**',
					_environment.src + 'bootstrap/*.*',
					_environment.src + 'bootstrap/.*',
					_environment.src + 'bootstrap/.*.*',
					_environment.src + 'bootstrap/CNAME',
					_environment.src + 'bootstrap/Gemfile',
					_environment.src + 'sass/**',
					_environment.src + 'v3.3.7.zip'
					]
				);
			}
		});
	}
	return;
});

/**
 * @task: 'update-style-banner'
 *
 * 	1. Runs 'update-css-banner' & 'clear-scss-banner'
 */
gulp.task( 'update-style-banner', ['update-css-banner', 'clear-scss-banner']);

/**
 * @task: 'update-css-banner'
 *
 *	1. Replaces the contents of 'style.css' with a new WP-approved project banner
 *
 */
gulp.task( 'update-css-banner', ['clone-repo'], function ( ) {
	var pathCss 		= _environment.src + 'style.css';    
	var textCss 		= fs.readFileSync(pathCss).toString();
	var linesCss 		= textCss.split('\n');
	var lineCountCss 	= linesCss.length;

    gulp.src( [ _environment.src + 'style.css' ])
    .pipe( removeLine( { "style.css" : [ '1-' + lineCountCss ] } ) )
    .pipe(header(_styleBanner.join("\n")))
    .pipe( gulp.dest( _environment.src ) )
    .pipe(notify('style.css banner updated'));
});

/**
 * @task: 'clear-scss-banner'
 *
 *	1. Optionally removes the default theme banner from 'style.scss' if not using Boostrap
 *
 */
gulp.task( 'clear-scss-banner', ['clone-repo'], function ( ) {
	if (!_useBootstrap) {
	    gulp.src( [ _environment.src + 'sass/style.scss' ])
	    .pipe( removeLine( { "style.scss" : [ '1-22' ] } ) )
	    .pipe( gulp.dest( _environment.src + 'sass/' ) )
	    .pipe(notify('sass/style.scss banner removed'));
	}
});

/**
 * @task: 'replace-package-name'
 *
 *	1. Replaces the default theme name with the packageName in the project's files
 *
 */
gulp.task('replace-package-name', ['update-style-banner'], function() {
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
 * 	1. Removes leftover and unwanted legacy files
 */
gulp.task('cleanup-template-files', ['clone-repo'], function () {
	return del([
		_environment.src + '.*',
		_environment.src + '.*.*',
		_environment.src + '.*.*.*'
		]
	);
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
 * - load-includes
 * - load-languages
 * - load-assets (a sub-task runner)
 * - load-fonts
 * - load-images
 * - compress-images
 * - load-styles
 * - load-js (a sub-task runner)
 * - process-js
 * - load-themeFiles
 * - js-enqueues
 * - style-enqueues
 * - default (a sub-task runner)
 *
 */
/**
 * @task: 'build'
 *
 *	1. Runs all of the specified 'build tasks'
 *
 */
gulp.task('build', [
	'load-includes',
	'load-languages',
	'load-assets',
	'load-themeFiles'
//	'watch'
]);

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
 * @task: 'load-assets'
 *
 *	1. Runs all of the 'build tasks' related to processing and copying the 
 *	the project's asset files to the project build's directory
 *
 */
gulp.task('load-assets', [
	'load-fonts',
	'load-images',
	'load-styles',
	'load-js'
	]
);

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
 * @task: 'load-styles'
 *
 *  1. Runs 'load-theme-styles' and 'load-libs-styles' as sub-tasks
 *
 */
gulp.task('load-styles', ['load-theme-styles', 'load-libs-styles']);
/**
 * @task: 'load-theme-styles'
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
gulp.task('load-theme-styles', ['load-fonts', 'load-images'], function(){
	return gulp.src(_style.src + (_useBootstrap ? _style.compileReqs : '{style.scss,rtl.scss}'))
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sourcemaps.init())
		.pipe( ( _useBootstrap ? less() : sass(_sassOpts).on('error', sass.logError) ) )
		.pipe(postcss([
			autoprefixer(_target_browsers)
		]))
		.pipe(sourcemaps.write())
	    .pipe(lineEndCorrect())
	    .pipe(rename(_package.name + '-theme-style.css'))
		.pipe(gulp.dest(_style.dest))
		.pipe(browserSync.stream({ match: '**/*.css' }))
    	.pipe(notify({message: _notices.buildMsgs.load_styles, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-libs-styles'
 *
 * This task processes 'themes/<project-name>/css/**' + ' /*.css'. 
 * 
 * 	1. Check to see if there any new or updated vendor CSS files
 * 	2. Concat all files into a single file
 * 	3. Correct line endings for non-unix systems
 *	4. Save the final file into the project's dev folder
 *
 */
gulp.task('load-libs-styles', function() {
	return gulp.src([_style.srcLibs + '**/*.css'])
		.pipe(plumber({ errorHandler: onError }))
	    .pipe(newer(_style.dest + _package.name + '-libs-style.css'))
	    .pipe(concat(_package.name + '-libs-style.css'))
	    .pipe(lineEndCorrect())
	    .pipe(gulp.dest(_style.dest))
    	.pipe(notify({message: _notices.buildMsgs.load_style_libs, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-js'
 *
 *	1. Copies the project's JS files to the project build's theme directory
 *
 */
gulp.task('load-js', ['load-libs-js', 'load-custom-js']);

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
/**
 * @TODO: if(useBootstrap) do not include 'navigation.js'
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
 * @task: 'load-libs-js'
 *
 * This task processes 'themes/<project-name>/js/libs/**' + ' /*.js'. 
 * 
 * 	1. Check to see if there any new or updated vendor JS files
 * 	2. If so, uglify any files that are not already minified
 * 	3. Rename these files to include the '.min' extension
 *	4. Concat all files into a single file
 * 	5. Correct line endings for non-unix systems
 *	6. Save the final file into the project's dev folder
 *
 */
gulp.task('load-libs-js', function() {
	return gulp.src([_js.src + 'libs/**/*.js'])
		.pipe(plumber({ errorHandler: onError }))
	    .pipe(newer(_js.dest + _package.name + '-libs.js'))
        .pipe(gulpif(["*.js", "!*.min.js"],
            uglify()
        ))
        .pipe(gulpif(["*.js", "!*.min.js"], // is this needed?
            rename({suffix: ".min"})
		))
	    .pipe(concat(_package.name + '-libs.js'))
	    .pipe(lineEndCorrect())
	    .pipe(gulp.dest(_js.dest))
    	.pipe(notify({message: _notices.buildMsgs.process_libs_js, title: _product.name, onLast: true}));
});

/**
 * @task: 'load-themeFiles'
 *
 *	1. Loads the project's template/theme files and folders to the project's dev directory
 *
 */
gulp.task('load-themeFiles', ['insert-enqueues'], function(){
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

gulp.task('insert-enqueues', ['load-assets'], function () {
	fs.readFile(_environment.src + 'functions.php', function (err, data) {
		if (err) 
		{
			return gutil.log(_product.name + ' - ' + _warning + ' - ' + _notices.buildMsgs.update_enqueues.missing);
		}
		if (data.indexOf(_injectEnqueues.test) >= 0) 
		{
			return gutil.log(_product.name + ' - ' + _notices.buildMsgs.update_enqueues.ok);
		} 
		else
		{
			return gulp.src([_environment.src + 'functions.php'], {base: _environment.src})
			.pipe(plumber({ errorHandler: onError }))
			.pipe(inject.after(_injectEnqueues.find, _injectEnqueues.insert )) // this borks
			.pipe(stripLine([_injectEnqueues.strip.navScript, 'use strict'])) // but this works
			.pipe(stripLine([_injectEnqueues.strip.skipLinkScript, 'use strict'])) // and so does this
		    .pipe(gulp.dest(_environment.src))
	    	.pipe(notify({message: _notices.buildMsgs.update_enqueues.updated, title: _product.name, onLast: true}));

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
/**
 * @TODO: 
 */
gulp.task('watch', function(){ 
	browserSync.init(_server);

	gulp.watch(_fonts.src + '**/*', ['load-fonts', reload]);
	gulp.watch(_img.src + '**', ['load-images', reload]);
	gulp.watch(_includes.src + '**/*', ['load-includes', reload]);
	gulp.watch(_js.src + '**/*', ['load-js', reload]);
	gulp.watch(_style.src + '**/*', ['load-styles']);
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
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
Plugins Tasks
-------------------------------------------------------------------------------------------------- */
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
//--------------------------------------------------------------------------------------------------

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
 *
 * @FUTURE: Add purgecss into the task-stream
 * See: https://www.purgecss.com/
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
