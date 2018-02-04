# Zero2WP v0.0.10
A build system for automating the WordPress development workflow.

## Introduction
Zero2WP is a robust build system for WordPress theme, plugin, and site developers. Zero2WP uses Nodejs, Gulp, BrowserSync, and PhP's integrated web server to track changes and instantly auto-reload your browsers as you work. 

### Features
Unlike most other build scripts, Zero2WP lets you work on multiple projects simultaneously from a single workbench. For each project, you can:

- Install the latest version of WordPress
- Clone a recent version of '_s'
- Optionally integrate Bootstrap3 w/Less
- CSS: compile Sass/Less, lint errors, autoprefix, write sourcemaps, minify, and correct line-endings
- JS: lint errors, order, concatenate, uglify, and correct line-endings
- Compress PNG, JPEG, GIF & SVG images
- Instantly update browsers on changes in project files
- ... more in the works (a11y, i18n/l10n, RTL, custom templates, etc.)

Note that Zero2WP uses a stable fork of '_s' that was last updated on Feb 4, 2018. 


## 1. Install Zero2WP

### 1.1 Before You Start

Before installing Zero2WP, make sure the following software is installed globally on your computer and is up to date:

- Git
- Nodejs
- Npm

You'll also need to have **PHP** and **MySQL** installed, either globally or as part of a server package such as XAMPP on Windows.

### 1.2 Clone the Repo

Open a terminal windoiw, go the folder from which you plan to serve your project files (i.e. 'public', or 'htdocs'), and clone the Zero2WP repo from GitHub with the following command:

```
git clone https://github.com/arnoldNuvisto/Zero2WP
```

- This will install Zero2WP into its own folder on your local machine. 

### 1.3 Update the Config File

While still in the terminal window, open the new **'Zero2WP** folder, then open the **'/config'** sub-folder. Now edit **'app-config.json'** to update the configuration details for your installation of Zero2WP, then save the file.

- FYI, the server variables in this file are passed to **Browsersync** - check out the Browsersync docs for more about these and other options.
- Also, you can ignore **project-config.json** for now - more on this file later.

### 1.4 Install the Dependencies

Next, go back to Zero2WP's root folder in the terminal window, and run the following command to install Zero2WP's dependencies:

```
npm install
```

- This will take a few minutes, so go grab a coffee.

### 1.5 Update the Nodejs Modules

Once npm has finished installing Zero2WP, you'll want to update any **Nodejs** that may be outdated.

First, make sure that you are in Zero2WP's root directory, then run this command to check if any updates are needed:

```
npm outdated
```
- This will list any Nodejs modules that need an update.

If npm found modules that need to be updated, run the following command:  

```
npm update
```
- This will update all the otdated Nodejs modules listed earlier.

Run the following command again to confirm the modules were updated:

```
npm outdated
```

That's it - ZeroWP is now installed and ready to use!

## 2. Start a Project

Now that Zero2WP is ready to use, the next step is to start a new project.

### 2.1 Set the Project Details 

In the terminal window, from Zero2WP's root directory, navigate to the **'/config'** directory and open **'project-config.json'** for editing. Now add the project details using the following example as a guideline. Close and save the file.

```javascript
{
	"testRun2"		: {
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
- This var, taken together with the details in 'project-config.json', will tell Zero2WP everything it needs to know about your project so it can correctly name directories and files, customize the default theme, and more.

### 2.2 Install WordPress

Next, install a fresh copy of **Wordpress** into the project's dev directory. Still working in the terminal window, and still in Zero2WP's root folder, run the following command:

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
- This will compile and copy the project's theme files into the themes directory of the project's Wordpress installation.

## 3. Launch the Project

Now that everything is place, we're ready to launch the new project. Run this command:

```
gulp
```

- This command initiates a series of tasks to automatically launch a PHP server and then open the project's install of Wordpress in your browser.
- This same task will also automatically update the project's dev folder as well as the browser window whenever a change in the source files is detected.

**IMPORTANT** 
- The first time you run 'gulp', you'll need to provide Wordpress with database connection details and set a project username and password. Once this has been completed, Wordpress will launch into the admin section. From there, simply activate the newly installed theme and you're good to go.


## 4. Package a Project

When you're finished with a project, you can use Zero2WP to create a production-ready distribution package. 

NOTE: This part of Zero2WP has not been written yet - coming soon.

# License
MIT
