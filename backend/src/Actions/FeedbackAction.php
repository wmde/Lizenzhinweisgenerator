<?php
namespace AttributionGenerator\Actions;

use Symfony\Component\HttpFoundation\Response;

class FeedbackAction {
	private $app;
	private $errors = [];

	function __construct( \Silex\Application $app ) {
		$this->app = $app;

		if ( $this->requestValid( $app['request'] ) ) {
			$this->sendMail(
				$app['request']->get( 'name' ),
				$app['request']->get( 'feedback' )
			);
		}
	}

	private function requestValid( \Symfony\Component\HttpFoundation\Request $request ) {
		if ( empty( $request->get( 'name' ) ) || empty( $request->get( 'feedback' ) ) ) {
			$this->errors[] = 'Alle Felder des Feedback-Formulars müssen ausgefüllt werden.';
			return false;
		}

		return true;
	}

	private function sendMail( $sender, $text ) {
		$message = \Swift_Message::newInstance()
			->setSubject( '[AttributionGenerator] Feedback from ' . $sender )
			->setFrom( [ 'noreply@attribution-generator.dev' ] )
			->setTo( [ $this->app['config']['feedback_email'] ] )
			->setBody( $text );

		try {
			$this->app['mailer']->send( $message );
		} catch ( Exception $e ) {
			$this->errors[] = 'Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuche es erneut.';
		}
	}

	private function success() {
		return [ 'message' => 'Vielen Dank für Dein Feedback!' ];
	}

	public function getResponse() {
		if ( empty( $this->errors ) ) {
			return json_encode( $this->success(), JSON_UNESCAPED_UNICODE );
		} else {
			return new Response(
				json_encode(
					[ 'errors' => $this->errors ],
					JSON_UNESCAPED_UNICODE
				),
				400
			);
		}
	}
}
