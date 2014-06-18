/**
 * @licence GNU GPL v3
 * @author Kai Nissen < kai.nissen@wikimedia.de >
 */
define( [
    'jquery',
    'dojo/i18n!./nls/NoApi',
    'app/ApplicationError',
    'app/Asset',
    'app/Author',
    'app/ImageInfo',
    'app/LicenceStore',
    'app/LICENCES'
],
    function(
        $,
        messages,
        ApplicationError,
        Asset,
        Author,
        ImageInfo,
        LicenceStore,
        LICENCES
        ) {
        'use strict';

        /**
         * Handler for simple file names.
         * @constructor
         */
        var Api = function() {

        };

        $.extend( Api.prototype, {
            /**
             * Generates an Asset object for a specific filename.
             *
             * @param {string} filename
             * @return {Object} jQuery Promise
             *         Resolved parameters:
             *         - {Asset}
             *         Rejected parameters:
             *         - {AjaxError}
             */
            getAsset: function( filename ) {
                var self = this,
                    deferred = $.Deferred();

                this._getFile( filename )
                    .done( function() {
                        var licence = new LicenceStore( LICENCES ).detectLicence( 'unknown' );
                        var anchorTag = $( '<a></a>' );
                        var author = new Author( anchorTag.append( document.createTextNode( messages['author-undefined'] ) ) );

                        var asset = new Asset(
                            filename,
                            messages['file-untitled'],
                            'mediatype',
                            licence,
                            self,
                            {
                                authors: [ author ]
                            },
                            ''
                        );
                        deferred.resolve( asset );
                    } )
                    .fail( function( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise();
            },

            getImageInfo: function( filename, imageSize, wikiUrl ) {
                var deferred = $.Deferred();

                var $img = $( '<img/>' )
                    .css( 'display', 'none' )
                    .attr( 'src', filename )
                    .load( function() {
                        $( 'body' ).append( $img );
                        deferred.resolve( new ImageInfo( filename, filename,
                            {
                                url: filename,
                                width: $img.width(),
                                height: $img.height()
                            }
                        ));
                    });

                return deferred.promise();
            },

            getLicenceStore: function() {
                return new LicenceStore();
            },

            _getFile: function( filename ) {
                var deferred = $.Deferred();
                var $img = $( '<img/>' )
                    .attr( 'src', filename )
                    .css( 'display', 'none' )
                    .error( function() {
                        deferred.reject( new ApplicationError( 'url-invalid' ) );
                    })
                    .load( function() {
                        $('body').append($img);
                        deferred.resolve( filename );
                    });
                return deferred.promise();
            },

            getDefaultUrl: function() {
                return '';
            }

        } );

        return Api;

    } );
