# Zero2WP v0.0.4
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
- ... more in the works (ES6 transpiling, dist tasks, i18n/l10n, custom templates, RTL, A11y, etc)

## 1. Install Zero2WP

### 1.1 Before You Start

Before installing Zero2WP, make sure the following software is installed globally on your computer and is up to date:

- Git
- Nodejs
- Npm

You'll also need to have PHP and MySQL installed, either globally or as part of a server package such as XAMPP on Windows.

### 1.2 Clone the Repo

Open a terminal, go the folder from where you plan to serve your project files (i.e. 'public', or 'htdocs'), and clone the Zero2WP repo from GitHub:

```
git clone https://github.com/arnoldNuvisto/Zero2WP
```

This will install Zero2WP into its own folder on your local machine. 

### 1.3 Update The Config File

While still in the terminal window, open this new folder and then open the **config** sub-folder. Now edit **config.json** with updated configuration details for your installation, then save the file.

- FYI, the server variables in this file are passed to Browsersync - check out the Browsersync docs for more about these and other options.

### 1.4 Install the Dependencies

Now run the following command to install Zero2WP's dependencies:

```
npm install
```

This will take a few minutes, so go grab a coffee - when you return, Zero2WP will be installed and ready to go!

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
This var will tell Zero2WP the name to use for naming the project's build, dev, and dist directories, as well as for customizing the default theme.

### 2.2 Install WordPress

### 2.3 Install Underscores

### 2.4 Run the Build

# License
MIT
