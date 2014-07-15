# Licence Attribution Generator

This project is aimed at helping more people to build upon legally and
to share creative works collected at Wikimedia Commons. A questionnaire
leads the user
through the process of collecting information needed when publishing
images from Wikipedia and other places to create a legally sufficient
attribution line.

Supported licences: Public Domain, CC0 1.0, CC BY 2.0 DE, CC BY 3.0 DE,
CC BY 3.0, CC BY-SA 2.0 DE, CC BY-SA 3.0 DE, CC BY-SA 3.0.

Currently deployed version: http://tools.wmflabs.org/file-reuse/

## Technical documentation

### Licence support

The licences supported by the application are defined in <code>app/LICENCES.js</code>. The complete licence text of each licence should be stored in the <code>licences</code> folder as these are used by the application.

### Internationalization

The application is ready for internationalization. Using the [Dojo Toolkit](http://dojotoolkit.org/) to manage internationalization, strings directly used within the application code are managed using resource bundles in <code>nls</code> subdirectories as per Dojo's definition.
HTML snippets used for page/page-like content and questionnaire pages are stored as HTML files in the <code>templates</code> directory mirroring the subdirectory schema applied within the <code>nls</code> folders.
To "activate" a locale, parallel to defining locale support in the root language files within the <code>nls</code> directories, the locale needs to be added to the <code>supportedLanguages</code> object in <code>templates/registry.js</code>.

### Coding conventions

Coding style adheres to the [Wikibase coding conventions](http://www.mediawiki.org/wiki/Wikibase/Coding_conventions).

### Testing

QUnit tests are located in the <code>tests</code> directory. Before merging changes, tests should be run by accessing <code>/tests/index.html</code> in a browser.
