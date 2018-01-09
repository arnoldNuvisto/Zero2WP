# Zero2WP v0.0.4
A build system for automating the WordPress development workflow.

## Introduction
Zero2WP is a robust build system for WordPress theme, plugin, and site developers. Zero2WP uses Nodejs, Gulp, BrowserSync, and PhP's integrated web server to track changes and instantly auto-reload your browsers. 

### Features
- Runs multiple projects simultaneously from a single workbench
- Installs the latest version of WordPress for each project
- Clones the latest version of Underscores for each project
- Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps, minification & line-ending correction
- Lints, orders, concatenates, uglifies & fixes line-endings in JS files
- Compresses PNG, JPEG, GIF & SVG images
- Instantly updates the browser on changes in project files
- ... more in the works (ES6 transpiling, dist tasks, i18n/l10n, custom templates, RTL, A11y, etc)

## 1. Install Zero2WP

**BEFORE YOU START**

Before you can use Zero2WP, make sure the following software is installed globally on your computer and is up to date:

- Git
- Nodejs
- Npm
- Gulp

You'll also need to have these installed, either globally or as part of a server package such as XAMPP on Windows:
- PhP
- MySQL

**LET'S GO**

### Clone the Repo

Open a terminal, go the folder from where you plan to serve your project files (i.e. 'public', or 'htdocs'), and clone the Zero2WP repo from GitHub:

```
git clone https://github.com/arnoldNuvisto/Zero2WP
```

This will install Zero2WP into its own folder on your local machine. 

### Update The Config File

While still in the terminal window, open this new folder and then open the **config** sub-folder. Now edit **config.json** with updated configuration details for your installation, then save the file.

- FYI, the server variables in this file are passed to Browsersync - check out the Browsersync docs for more about these and other options.

### Install the Dependencies

Now run the following command to install Zero2WP's dependencies:

```
npm install
```

This will take a few minutes, so go grab a coffee - when you return, Zero2WP will be installed and ready to go!

## 2. Launch a Project

Now that Zero2WP is ready, the next step is to launch a new project.

### Set the Project Name 

Still working in the terminal window, navigate to the root of the Zero2WP folder and open **gulpfile.js** for editing. Locate the 'Project Variables' section, update the projectName with the title for your project as shown below, and save the file.

```javascript
/* -------------------------------------------------------------------------------------------------
Project Variables
-------------------------------------------------------------------------------------------------- */
// START EDITING
var projectName		= '<your project's name goes here>;
// STOP EDITING
//--------------------------------------------------------------------------------------------------
```
This will tell Zero2WP the name to use for naming the project's build, dev, and dist directories, as well as for customizing the default theme.

### Install WordPress

### Install Underscores

### Run the Build

# License
MIT
