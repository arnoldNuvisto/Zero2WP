# Zero2WP v0.1.0
A build system for automating the WordPress development workflow.

http://www.wordpressify.co/ 

### Introduction
Zero2WP is a modern workflow for WordPress development that uses Nodejs, Gulp, BrowserSync, and PhP's integrated web server to track changes and auto-reload one or more browsers. Several style pre-processors are built in, plus Zero2WP is ES6-ready.

## Features

- **DEV SERVER**
A development server for PHP based in Node. Powered by BrowserSync.
- **AUTO-RELOAD**
Watches for all your changes and reloads in real-time.
- **STYLES**
Styles pre-processors: PostCSS, Scss, or Less with sourcemaps.
- **JAVASCRIPT ES6**
Babel compiler for writing next generation JavaScript.
- **EXTERNAL LIBRARIES**
Easy import external JavaScript libraries and npm scripts.
- **CUSTOMIZABLE**
Flexible build customization, managed by Gulp tasks.

# 1. Project Setup
To install Zero2WP, open a terminal, go the folder for your project, and clone the repo from GitHub:
```
git clone https://github.com/arnoldNuvisto/Zero2WP
```
- This will install the Zero2WP repo to the project directory on your local machine. In the terminal window, open the newly created Zero2WP folder and install the dependencies as follows:

**INSTALL DEPENDENCIES**

```
npm install
```

**CHANGE TEMPLATE NAME**

- Zero2WP is now installed and we're almost ready. Open the **gulpfile.js** file and edit the default project variables as needed:

```javascript
/* -------------------------------------------------------------------------------------------------
Theme Name
 ------------------------------------------------------------------------------------------------- */
var themeName = 'yourThemeName';
//--------------------------------------------------------------------------------------------------
```
# 2. Launching the Workflow
**INSTALL WORDPRESS**

- First, install WordPress to your project with the following command:

```
npm run install:wordpress
```

- This script will download the latest version of WordPress to the 'build/dev' folder.

**START WORKFLOW**

- Now launch the development server using this command:

```
npm run dev
```
- This script will copy over the core files for your new theme into the 'build/dev/wordpress/wp-content/themes' directory
- NOTE: If you are running a fresh installation, you'll need to launch the WordPress wizard in your bowser in order to specify such things as the site name, description, database and login details, etc.
- You're good to go!

# 3. Migrating to Production
**PRODUCTION TEMPLATE**

-  Run the command to generate production-ready distribution files for your theme:

```
npm run prod
```

- The theme will be saved as a zip file in:

```
dist/Zero2WP.zip
```

- Your production-ready theme will be saved as a zip file in:

**WINDOWS USERS**

- If you are running on a Windows machine, note that PHP must be installed and properly configured. Check the documentation at [gulp-connect-php](https://www.npmjs.com/package/gulp-connect-php).

# 3. Styles, PostCSS and Scss

## PostCSS

By default Zero2WP supports [PostCSS](http://postcss.org/). PostCSS comprises numerous plugins that allow for extensive customization. [CSSNext](http://cssnext.io/) is installed by default. Read more about PostCSS [here](https://ashleynolan.co.uk/blog/postcss-a-review).

As you can notice from the code below we have 2 different sets of plugins. One for the development environment (pluginsDev) and one for the production task (pluginsProd).

**POSTCSS PLUGINS**

```javascript
//--------------------------------------------------------------------------------------------------
/* -------------------------------------------------------------------------------------------------
PostCSS Plugins
 ------------------------------------------------------------------------------------------------- */
var pluginsDev = [
	partialimport,
	cssnext({
		features: {
			colorHexAlpha: false
		}
	})
];
var pluginsProd = [
	partialimport,
	cssnext({
		features: {
			colorHexAlpha: false
		}
	})
];
//--------------------------------------------------------------------------------------------------
```

**WRITING STYLES**

Styles are written to:

```
components/assets/css/main.css
```

The template definition is in: 

```
scr/style.css
```

## SASS
You can install Sass and use it as a main style preprocessor:

```
npm install gulp-sass --save-dev
````

Now include sass in the gulpfile.js

```javascript
var sass = require('gulp-sass');
````

Change the gulp tasks style-dev to:

```javascript
gulp.task('style-dev', function () {
	return gulp
	.src("src/style/style.scss")
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("build/wordpress/wp-content/themes/" + themeName))
		.pipe(browserSync.stream({ match: "**/*.css" }));
});
```

Change the gulp tasks style-prod to:


```javascript
gulp.task('style-prod', function () {
	return gulp.src('src/style/style.scss')
		.pipe(sass().on("error", sass.logError))
		.pipe(gulp.dest('dist/themes/' + themeName))
});
```

The watch task also has to be changed to watch for .scss filetypes:

```javascript
gulp.task('watch', function () {
	gulp.watch(['src/style/**/*.scss'], ['style-dev']);
	gulp.watch(['src/js/**'], ['reload-js']);
	gulp.watch(['src/fonts/**'], ['reload-fonts']);
	gulp.watch(['src/theme/**'], ['reload-theme']);
});
```

# 4. Fonts and Images
## Images

Template image assets are recommended to be stored in:

```
src/theme/img/
```

Ideally all user-managed media files should be managed through the [Media Library](https://codex.wordpress.org/Media_Library_Screen) of WordPress. In short, keep only theme/template specific media assets in this folder.

## Fonts

Project-specific font files can be included in:

```
src/fonts/
```

# 5. JavaScript ES6

Zero2WP handles ES6 JavaScript using [Babel](https://babeljs.io/). Babel provides support for the latest version of JavaScript so you can use the new ES6 syntax immediately.
Your JavaScript code should be located in:

```
src/js/
```

WordPressify will watch for changes under the js directory and bundle the code in a single file, which will be included in the footer of the page as:

```
footer-bundle.js
```
Check the Gulp configuration to learn more about how JavaScript is generated.

# 6. External Libraries

Including external JavaScript libraries is as simple as installing the npm script and include it in the **gulpfile.js**

```javascript
/* -------------------------------------------------------------------------------------------------
Header & Footer JavaScript Boundles
-------------------------------------------------------------------------------------------------- */
var headerJS = [
	'node_modules/jquery/dist/jquery.js',
	'node_modules/nprogress/nprogress.js',
	'node_modules/aos/dist/aos.js',
	'node_modules/isotope-layout/dist/isotope.pkgd.js'
];
var footerJS = [
	'src/js/**'
];
//--------------------------------------------------------------------------------------------------
```

You can include the scripts in the head of the page before the DOM is loaded by placing them in the **headerJS** array.
Or in the footer of the page after the DOM is loaded in the array **footerJS**. Only footer scripts are processed with Babel thus supporting ES6, however you can change this in the configuration if you want to run both header and footer scripts with Babel.

A build restart is required for changes to take effect.


# 7. Build Backups

Zero2WP lets you backup the current state of the build with the following command:

```
$ npm run backup
```

Files will be compressed in a ZIP and stored in the directory:

```
backups/
```

# 8. Database
## MySQL Server
You will still need a database to connect with your installation. The recommended solution is to install [MySQL](https://dev.mysql.com/downloads/mysql/) on your local machine and follow the [installation instructions](https://dev.mysql.com/doc/refman/5.7/en/installing.html).

# Changelog

**v0.0.1**
- Initial commit

# License
MIT
