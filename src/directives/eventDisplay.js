
"use strict";

angular.
  module( "mwl.calendar" ).
  directive( "mwlEventDisplay", [ "$compile", function ( $compile ) {
    return {
      restrict: "A",
      scope: true,
      link: function linkFunction ( scope, element, attrs ) {

        var linkedDirective = attrs.mwlEventDisplay;

        if( linkedDirective ) {

          //we remove our directive so as not to loop
          element.removeAttr( "mwl-event-display" );

          //in link, ng-repeat will have already $compiled and provided
          //us with all of our repeats. so we remove that too
          element.removeAttr( "ng-repeat" );

          if( !element.attr( linkedDirective ) ) {

            element.attr( linkedDirective, true );

            element.attr( "event", "event" );
            element.attr( "event-click", "eventClick()" );
            element.attr( "event-edit-click", "eventEditClick()" );
            element.attr( "event-delete-click", "eventDeleteClick()" );
            element.attr( "edit-event-html", "editEventHtml" );
            element.attr( "delete-event-html", "deleteEventHtml" );

            $compile( element )( scope );
          }

        }

      }
    };
  } ] );
