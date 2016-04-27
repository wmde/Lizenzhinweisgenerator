<?php
namespace AttributionGenerator\Actions;

use Symfony\Component\HttpFoundation\Response;

class FeedbackAction {
	private $app;
	private $i18n;
	private $errors = [];

	function __construct( \Silex\Application $app ) {
		$this->app = $app;
		$request = $app['request'];

		$lang = !empty( $request->get( 'lang' ) ) ? $request->get( 'lang' ) : 'de';
		$langFile = __DIR__ . '/../../../i18n/' . $lang . '/i18n.json';
		if( !file_exists( $langFile ) ) {
			$langFile = __DIR__ . '/../../../i18n/de/i18n.json';
		}
		$this->i18n = json_decode( file_get_contents( $langFile ), true );

		if ( $this->requestValid( $app['request'] ) ) {
			$this->sendMail(
				$request->get( 'name' ),
				$request->get( 'feedback' )
			);
		}
	}

	private function requestValid( \Symfony\Component\HttpFoundation\Request $request ) {
		if ( empty( $request->get( 'name' ) ) || empty( $request->get( 'feedback' ) ) ) {
			$this->errors[] = $this->i18n['error']['feedback-blank-fields'];
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
			$this->errors[] = $this->i18n['error']['feedback-generic'];
		}
	}

	private function success() {
		return [ 'message' => $this->i18n['index']['feedback-thanks'] ];
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
