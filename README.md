# Attribution Generator

Using and sharing works licenced under Creative Commons requires specifying an attribution as defined by the respective licence. This application helps generating a legally correct attribution with images from Wikipedia and Wikimedia Commons.
A questionnaire leads through the process of collecting information needed when publishing images from Wikipedia and Commons to create a legally sufficient attribution line.

[![Build Status](https://travis-ci.org/wmde/Lizenzhinweisgenerator.svg?branch=master)](https://travis-ci.org/wmde/Lizenzhinweisgenerator
)

## Official version

https://lizenzhinweisgenerator.de

## Technical documentation

### Licence support

The licences supported by the application are defined in <code>js/app/LICENCES.js</code>.

### Coding conventions

Coding style adheres to the [Wikibase coding conventions](http://www.mediawiki.org/wiki/Wikibase/Coding_conventions).

### Building the code

Run `npm install`to pull any new dependencies.

Browserify is used to build and minify the JS code.

* `npm run build` builds a production version
* `npm run watch` builds a development version of the code that is not minified and will listen for updates on all JS files
* `npm run build-test` builds the test code
* `npm run watch-test` builds the test code unminified and listens for changes on test files

### Testing

QUnit tests are located in the <code>tests</code> directory. Before merging changes, tests should be run by accessing <code>/tests/index.html</code> in a browser after executing `npm run build-test` or from command line using [qunit-phantomjs-runner](https://github.com/jonkemp/qunit-phantomjs-runner):
```bash
npm run build-test && phantomjs path/to/runner.js ./tests/index.html
```

### Backend

The backend code for the feedback form can be found in the `/backend` directory. Its dependencies are installed via `composer install` and tests can be run by executing `phpunit`.

### Reporting Issues

Please file all new bug reports and feature requests on [Phabricator](https://phabricator.wikimedia.org/maniphest/task/create/?projects=tcb-team,attribution-generator&title=%5BAG%5D) or use the "Feedback" link on https://lizenzhinweisgenerator.de.
