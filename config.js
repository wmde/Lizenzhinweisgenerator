this.app = this.app || {};

app.config = {
	baseUrl: 'app',
	paths: {
		jquery: '../lib/jquery/jquery-1.11.0.min',
		qunit: '../lib/qunit/qunit-1.14.0',
		tests: '../tests'
	},
	shim: {
		qunit: {
			exports: 'QUnit',
			init: function() {
				QUnit.config.autoload = false;
				QUnit.config.autostart = false;
			}
		}
	}
};
