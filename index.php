<?php

// Get the language, fallback to de if none is passed
$lang = isset( $_GET['lang'] ) ? $_GET['lang'] : 'de';

// Load the i18n file
if( !file_exists( __DIR__ . '/i18n/' . $lang . '/i18n.json' ) ) {
    $lang = 'de';
}
$i18nData = file_get_contents( __DIR__ . '/i18n/' . $lang . '/i18n.json' );
$i18nData = json_decode($i18nData, true);

// Get the base html to output
$html = file_get_contents( __DIR__ . '/index.base.html' );
$html = str_replace( 'i18n.lang', $lang, $html );

// If we have any i18n data replace the i18n codes with new strings
if ( $i18nData && isset( $i18nData['index'] ) ) {
    foreach( $i18nData['index'] as $key => $string ) {
        $html = str_replace( 'i18n.index.' . $key, $string, $html );
    }
}

// Also replace html snippets
$htmlFiles = [
    'about',
    'feedback',
    'legal',
    'private-use',
];
foreach( $htmlFiles as $file ) {
    $path = __DIR__ . '/i18n/' . $lang . '/' . $file . '.html';
    if( !file_exists( $path ) ) {
        $path = __DIR__ . '/i18n/de/' . $file . '.html';
    }
    $html = str_replace( 'i18n.html.' . $file, file_get_contents( $path ), $html );
}

// Output the html
echo $html;
