'use strict';

var $ = require( 'jquery' );

var DialogueStep = function( name ) {
	this._name = name;
};

$.extend( DialogueStep.prototype, {
	/**
	 * @type {string}
	 */
	_name: null,

	/**
	 * @type {Object}
	 */
	_data: null,

	getName: function() {
		return this._name;
	},

	/**
	 *
	 * @param {Object} data - data collected from the dialogue step's form
	 */
	complete: function( data ) {
		this._data = data;
	},

	/**
	 * @returns {Object}
	 */
	getData: function() {
		return this._data;
	}
} );

module.exports = DialogueStep;
