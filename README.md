# Zero2WP v0.0.9
A build system for automating the WordPress development workflow.

## Introduction
Zero2WP is a robust build system for WordPress theme, plugin, and site developers. Zero2WP uses Nodejs, Gulp, BrowserSync, and PhP's integrated web server to track changes and instantly auto-reload your browsers. 

### Features
Zero2WP lets you run multiple projects simultaneously from a single workbench:

- Install the latest version of WordPress for each project
- Clone the latest version of Underscores for each project
- Optionally integrate Bootstrap3 w/Less
- Sass/Less to CSS conversion, error catching, Autoprefixing, Sourcemaps, minify & correct line-endings
- Lint, order, concatenate, uglify & correct line-endings in JS
- Compress PNG, JPEG, GIF & SVG images
- Instantly update browsers on changes in project files
- ... more in the works (dist tasks, i18n/l10n, custom templates, RTL, A11y, etc)

## 1. Install Zero2WP

### 1.1 Before You Start

Before installing Zero2WP, make sure the following software is installed globally on your computer and is up to date:

- Git
- Nodejs
- Npm

You'll also need to have **PHP** and **MySQL** installed, either globally or as part of a server package such as XAMPP on Windows.

### 1.2 Clone the Repo

Open a terminal, go the folder from where you plan to serve your project files (i.e. 'public', or 'htdocs'), and clone the Zero2WP repo from GitHub with the following command:

```
git clone https://github.com/arnoldNuvisto/Zero2WP
```

- This will install Zero2WP into its own folder on your local machine. 

### 1.3 Update The Config File

While still in the terminal window, open the new **'Zero2WP'** folder, then open the **'config'** sub-folder. Now edit **'config.json'** to update the configuration details for your installation, then save the file.

- FYI, the server variables in this file are passed to Browsersync - check out the Browsersync docs for more about these and other options.

### 1.4 Install the Dependencies

Now run the following command to install Zero2WP's dependencies:

```
npm install
```

- This will take a few minutes, so go grab a coffee - when you return, Zero2WP will be installed and ready to go!

## 2. Launch a Project

Now that Zero2WP is up and running, the next step is to launch a new project.

### 2.1 Set the Project Details 

In the terminal window, navigate to the root of the Zero2WP folder and open **'config/project-config.json'** for editing. Now add the project details using the following example as a guideline. Close and save the file.

```javascript
{
	"testRun"		: {
		"URI" 			: false,
		"license" 		: "GNU General Public License v2 or later",
		"licenseURI" 	: "http://www.gnu.org/licenses/gpl-2.0.html",
		"description" 	: "Test project with _s & Bootstrap",
		"version"		: "0.0.1",
		"useBootstrap"	: true
	}
}
```
- FYI, you can add as many projects to this file as you wish.

Still in the terminal window, go back to Zero2WP's root folder and open **'gulpfile.js'** for editing. Locate the **'Project Variables'** section, update the **'projectName'** with the title for your project as shown below, then save the file.

```javascript
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING

var projectName			= "testRun"; // REQD // Upper & lowercase letters & numbers only

// STOP EDITING
//--------------------------------------------------------------------------------------------------
```
- This var, taken together with the details in the project config file, will tell Zero2WP everything it needs to know about your project so it can correctly name directories and files, customize the default theme, and more.

### 2.2 Install WordPress

Next, install a fresh copy of wordpress into the project's dev directory. Still working in the terminal window, and still in the root of the **'Zero2WP'** folder, run the following command:

```
gulp install-wordpress
```
- This will create a new folder for your project in **'Zero2WP/dev/'**, and then install a fresh copy of Wordpress.

### 2.3 Install Underscores

With Wordpress now in place, install a fresh copy of the **Underscores** template source files into the project theme directory. Working from the Zero2WP root directory, run the following command:

``` 
gulp install-template
```

- This will clone the latest version of Underscores from GitHub and install it into a new folder for your theme in **'Zero2WP/themes/'** 
- This will also update the style.css and style.scss with a new project banner
- Optionally, this will also install and initialize **Bootstrap 3.3.7 with Less** 


### 2.4 Run the Build

Next, push the project's theme files into the project's dev directory. Run this command:

```
gulp build
```
- This will push the project's theme files into the themes directory of the project's Wordpress install.

## 3. Launch the Project

Now that everything is place, we're ready to launch the project. Run this command:

```
gulp
```

- This command launches a 'watch' task, which automatically launches a PHP server and then opens Wordpress in your browser.
- The watch task will also automatically update both the project's dev folder and the browser window whenever a change in the source files is detected.

**IMPORTANT** 
- The first time you run 'gulp', you'll need to provide Wordpress with database connection details and set a project username and password. Once this has been completed, Wordpress will launch into the admin section. From there, simply activate the newly installed theme and you're good to go.


## 4. Package a Project

When you're finished with a project, you can use Zero2WP to create a production-ready distribution package. 

NOTE: This part of Zero2WP has not been written yet - coming soon.

# License
MIT
