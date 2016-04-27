<?php

// Get the language, fallback to de if none is passed
$lang = isset( $_GET['lang'] ) ? $_GET['lang'] : 'de';

// Load the i18n file
$i18nData = file_get_contents(__DIR__ . '/js/i18n.json');
$i18nData = json_decode($i18nData, true);
$i18nData = isset( $i18nData[$lang] ) ? $i18nData[$lang] : null;

// Get the base html to output
$html = file_get_contents( __DIR__ . '/index.base.html' );

// If we have any i18n data replace the i18n codes with new strings
if ( $i18nData && isset( $i18nData['index'] ) ) {
    foreach( $i18nData['index'] as $key => $string ) {
        $html = str_replace( 'i18n.index.' . $key, $string, $html );
    }
}

// Output the html
echo $html;
