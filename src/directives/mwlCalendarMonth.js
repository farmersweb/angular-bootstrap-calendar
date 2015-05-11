'use strict';

angular
  .module('mwl.calendar')
  .directive('mwlCalendarMonth', function() {
    return {
      templateUrl: 'templates/month.html',
      restrict: 'EA',
      require: '^mwlCalendar',
      scope: {
        events: '=calendarEvents',
        currentDay: '=calendarCurrentDay',
        editEvents: "=editEvents",
        eventClick: '=calendarEventClick',
        eventEditClick: '=calendarEditEventClick',
        eventDeleteClick: '=calendarDeleteEventClick',
        editEventHtml: '=calendarEditEventHtml',
        deleteEventHtml: '=calendarDeleteEventHtml',
        autoOpen: '=calendarAutoOpen',
        useIsoWeek: '=calendarUseIsoWeek',
        timespanClick: '=calendarTimespanClick',
        canDrillDownTo: "&",
        dateFilter: "&",
        monthDayIsWeekend: "&",
        monthStartDate: "=",
        monthEndDate: "=",
        monthDisplayEventCount: "=",
        monthEventDisplayDirective: "="
      },
      controller: function($scope, $sce, $timeout, moment, calendarHelper) {
        var firstRun = false,
            highlightedDay,
            skipUpdateThisDigest,
            //private functions
            isWeekend,
            dayEnabled,
            dayHasEvents;

        $scope.$sce = $sce;

        function updateView() {

          $scope.view = calendarHelper.getMonthView( $scope.events,
                                                     $scope.currentDay,
                                                     $scope.useIsoWeek,
                                                     $scope.monthStartDate,
                                                     $scope.monthEndDate );

          //Auto open the calendar to the current day if set
          if ($scope.autoOpen && !firstRun) {
            $scope.view.forEach(function(week, rowIndex) {
              week.forEach(function(day, cellIndex) {
                if (day.inMonth && moment($scope.currentDay).startOf('day').isSame(day.date.startOf('day'))) {
                  $scope.dayClicked(rowIndex, cellIndex, true);
                  $timeout(function() {
                    firstRun = false;
                  });
                }
              });
            });
          }

        }

        $scope.$watch( 'currentDay', updateView );

        $scope.$watch( 'events', function () {
          if( !skipUpdateThisDigest ) {
            updateView();
          }
          skipUpdateThisDigest = false;
        } );

        $scope.weekDays = calendarHelper.getWeekDayNames(true, $scope.useIsoWeek);

        $scope.dayClasses = function dayClasses( day, dayOfWeek ) {
          return {'cal-day-outmonth': !day.inMonth,
                  'cal-day-inmonth': day.inMonth,
                  'cal-day-weekend': isWeekend( day, dayOfWeek ),
                  'cal-day-enabled': dayEnabled( day, dayOfWeek ),
                  'cal-day-today': day.isToday,
                  'cal-day-has-events': dayHasEvents(day) };
        };

        dayHasEvents = function(day) {
          if (day.events.length > 0) {
            return true;
          } else {
            return false;
          }
        };

        $scope.dayClicked = function(rowIndex, cellIndex, dayClickedFirstRun) {

          if (!dayClickedFirstRun) {
            $scope.timespanClick({$date: $scope.view[rowIndex][cellIndex].date.startOf('day').toDate()});
            skipUpdateThisDigest = true;
            updateView();
          }

          if ( !$scope.editEvent ) {
            return;
          }

          var handler = calendarHelper.toggleEventBreakdown($scope.view, rowIndex, cellIndex);
          $scope.view = handler.view;
          $scope.openEvents = handler.openEvents;


        };

        $scope.drillDown = function(day) {
          if( $scope.canDrillDownTo() ) {
            $scope.calendarCtrl.changeView('day', moment($scope.currentDay).clone().date(day).toDate());
          }
        };

        $scope.highlightEvent = function( $event ) {

          if( highlightedDay ) {
            highlightedDay.highlighted = false;
          }

          skipUpdateThisDigest = true;
          $event.highlighted = true;
          highlightedDay = $event;

        };

        isWeekend = function ( day, dayOfWeek ) {
          var result = $scope.monthDayIsWeekend( { "$dayOfWeek": dayOfWeek,
                                                   "$day": day } );
          if( typeof result !== "undefined" ) {
            return result;
          }
          return dayOfWeek === 5 || dayOfWeek === 6;
        };

        dayEnabled = function ( day, dayOfWeek ) {
          var result = $scope.dateFilter( { "$dayOfWeek": dayOfWeek,
                                            "$day": day } );
          if( typeof result !== "undefined" ) {
            return result;
          }
          return true;
        };

      },
      link: function(scope, element, attrs, calendarCtrl) {
        scope.calendarCtrl = calendarCtrl;
      }
    };
  });
