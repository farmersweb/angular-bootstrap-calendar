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
        eventClick: '=calendarEventClick',
        eventEditClick: '=calendarEditEventClick',
        eventDeleteClick: '=calendarDeleteEventClick',
        editEventHtml: '=calendarEditEventHtml',
        deleteEventHtml: '=calendarDeleteEventHtml',
        autoOpen: '=calendarAutoOpen',
        useIsoWeek: '=calendarUseIsoWeek',
        timespanClick: '=calendarTimespanClick',
        canDrillDownTo: "&",
        monthStartDate: "=",
        monthEndDate: "=",
        monthDisplayEventCount: "=",
        monthEventDisplayDirective: "="
      },
      controller: function($scope, $sce, $timeout, moment, calendarHelper) {
        var firstRun = false,
            highlightedDay,
            skipUpdateThisDigest;

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

        $scope.weekDays = calendarHelper.getWeekDayNames(false, $scope.useIsoWeek);

        $scope.dayClicked = function(rowIndex, cellIndex, dayClickedFirstRun) {

          if (!dayClickedFirstRun) {
            $scope.timespanClick({$date: $scope.view[rowIndex][cellIndex].date.startOf('day').toDate()});
            skipUpdateThisDigest = true;
            updateView();
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

      },
      link: function(scope, element, attrs, calendarCtrl) {
        scope.calendarCtrl = calendarCtrl;
      }
    };
  });
