# Zero2WP v0.0.6
A build system for automating the WordPress development workflow.

## Introduction
Zero2WP is a robust build system for WordPress theme, plugin, and site developers. Zero2WP uses Nodejs, Gulp, BrowserSync, and PhP's integrated web server to track changes and instantly auto-reload your browsers. 

### Features
- Run multiple projects simultaneously from a single workbench
- Install the latest version of WordPress for each project
- Clone the latest version of Underscores for each project
- Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps, minify & correct line-endings
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

### 2.1 Set the Project Name 

Still working in the terminal window, navigate to the root of the Zero2WP folder and open **'gulpfile.js'** for editing. Locate the **'Project Variables'** section, update the **'projectName'** with the title for your project as shown below, then save the file.

```javascript
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING
var projectName		= '<your project's name goes here>;
// STOP EDITING
//--------------------------------------------------------------------------------------------------
```
- This var will tell Zero2WP the name to use for naming the project's directories and files, as well as for customizing the default theme.

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


### 2.4 Run the Build

Next, push the project's theme files into the project's dev directory, and launch Wordpress. Run this command:

```
gulp build
```
- This will push the project's theme files into the themes directory of the project's Wordpress install, launch a PHP server, and then open Wordpress in your browser.

- **Important:** when you run **'gulp build'**, Zero2WP also activates a 'watch' task that listens for changes to project files in **'Zero2Wp/themes/'**, and automatically updates both the dev folder as well as the browser whenever a change is detected.

### 2.5 Activate Wordpress

At this point, you'll need to provide Wordpress with database connection details as well as set a project username and password. Once this has been completed, Wordpress will launch into the admin section. 

From here, simply activate the newly installed theme and you're good to go.

## 3. Update a Project

When launching a new project, Zero2WP also launches a PHP server that lets you immediately see project updates in the browser. But what if you terminate the session (such as when you're done for the day) and need to 'relaunch' the server?

The solution is simple. Just run this one-word command and you're good to go:

```
gulp
```
- This launches the previously-mentioned 'watch' task, which automatically sets up a new server session for you.

Note that you could also just run 'gulp build' again. However this will force upload of the entire set of theme files, which is slower and less efficient. Best to stick with just 'gulp'.

## 4. Package a Project

When you're finished with a project, you can use Zero2WP to create a production-ready distribution package. 

NOTE: This part of Zero2WP has not been written yet - coming soon.

# License
MIT
