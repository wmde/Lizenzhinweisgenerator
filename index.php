<?php

// Get the language, fallback to de if none is passed
$lang = isset( $_GET['lang'] ) ? $_GET['lang'] : 'de';

// Load the i18n file
if( !file_exists( __DIR__ . '/i18n/' . $lang . '/i18n.json' ) ) {
    $lang = 'de';
}
$i18nDir = __DIR__ . '/i18n';
$i18nData = file_get_contents( $i18nDir . '/' . $lang . '/i18n.json' );
$i18nData = json_decode($i18nData, true);

// Get the url if passed
$url =  isset( $_GET['url'] ) ? $_GET['url'] : '';

// Get the base html to output
$html = file_get_contents( __DIR__ . '/index.base.html' );
$html = str_replace( '{{i18n.lang}}', $lang, $html );
$html = str_replace( '{{url}}', htmlspecialchars( $url ), $html );

// If we have any i18n data replace the i18n codes with new strings
if ( $i18nData && isset( $i18nData['index'] ) ) {
    foreach( $i18nData['index'] as $key => $string ) {
        $html = str_replace( '{{i18n.index.' . $key . '}}', $string, $html );
    }
}

// Iterate over the i18n subdirectories (ISO 639-1 codes) to construct a
// <li> element representation for the dropdown options
$langDirs = array_filter( glob( $i18nDir . '/*'), 'is_dir');
$languageOptions = '';
foreach ( $langDirs as $langDir ) {
  $isoLang = pathinfo($langDir)['basename'];
  $languageOptions .= '<li><a href="?lang=' . $isoLang .'">' . $isoLang . '</a></li>';
}
// ... and insert that string into the template
$html = str_replace( '{{ languageOptions }}', $languageOptions, $html);

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
    $html = str_replace( '{{i18n.html.' . $file . '}}', file_get_contents( $path ), $html );
}

// Output the html
echo $html;
