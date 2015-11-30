'use strict';

var $ = require( 'jquery' ),
	AttributionDialogue = require( '../AttributionDialogue' ),
	DialogueEvaluation = require( '../DialogueEvaluation' ),
	DialogueEvaluationView = require( './DialogueEvaluationView' ),
	InfoBoxView = require( './InfoBoxView' ),
	Messages = require( '../Messages' );

var AttributionDialogueView = function( asset ) {
	this._dialogue = new AttributionDialogue( asset );
	this._dialogue.init();

	this._privateUseBox = new InfoBoxView(
		'private-use',
		Messages.t( 'info-box.private-use' ) +
			'<a class="track-click" data-track-category="Navigation" data-track-event="Private Use" href="#" data-toggle="modal" data-target="#private-use-modal">' + Messages.t( 'info-box.private-use-more-link' ) + '</a>',
		'<button class="green-btn small-btn close-info hide-forever">' + Messages.t( 'info-box.dont-show-again' ) + '</button>'
	);

	this._portedLicenceBox = new InfoBoxView(
		'ported-licence',
		Messages.t( 'info-box.ported-licence' ),
		'<button class="green-btn small-btn close-info">' + Messages.t( 'info-box.understood-and-close' ) + '</button>'
	);
};

$.extend( AttributionDialogueView.prototype, {
	/**
	 * @type {InfoBox}
	 */
	_privateUseBox: null,

	/**
	 * @type {InfoBox}
	 */
	_portedLicenceBox: null,

	/**
	 * @type {AttributionDialogue}
	 */
	_dialogue: null,

	/**
	 * Turns a $form.serializeArray return value into an object
	 * @param {Object[]} formValues
	 * @returns {{}}
	 * @private
	 */
	_formValuesToObj: function( formValues ) {
		var form = {};
		$.each( formValues, function() {
			form[ this.name ] = this.value;
		} );

		return form;
	},

	_submit: function( e, $dialogue ) {
		var self = this;

		this._dialogue.currentStep().complete( this._formValuesToObj(
			$dialogue.find( 'form' ).serializeArray()
		) );
		$dialogue.animate( { opacity: 0 }, 500, function() {
			self.render( $dialogue );
			$dialogue.animate( { opacity: 1 }, 500 );
		} );
		e.preventDefault();
	},

	_nextStepOrDone: function() {
		if( this._dialogue.currentStep() ) {
			return this._dialogue.currentStep().render();
		}

		return new DialogueEvaluationView( new DialogueEvaluation(
			this._dialogue.getAsset(),
			this._dialogue.getData()
		) ).render();
	},

	_toggleQuestionMark: function( e ) {
		$( this ).toggleClass( 'active' );
		$( '#' + $( this ).data( 'target' ) ).slideToggle();

		e.preventDefault();
	},

	/**
	 * @param {jQuery} $dialogue
	 */
	render: function( $dialogue ) {
		var $content = this._nextStepOrDone(),
			self = this,
			$infoBox = $( '#info-box' );

		$infoBox.html( this._privateUseBox.render() );
		if( this._dialogue.getAsset().getLicence().isInGroup( 'ported' ) ) {
			$infoBox.append( this._portedLicenceBox.render() );
		}

		$content.find( '.immediate-submit input:checkbox' ).click( function() {
			$( this ).closest( 'form' ).submit();
		} );
		$content.find( 'form' ).submit( function( e ) {
			self._submit( e, $dialogue );
		} );
		$content.find( '.question-mark' ).click( this._toggleQuestionMark );

		$dialogue.html( $content );
	}
} );

module.exports = AttributionDialogueView;
