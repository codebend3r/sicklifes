/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $rootScope, $timeout, $apiFactory, $stateParams, $fireBaseService, $updateDataUtils, $momentService, $localStorage) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.dataKeyName = 'managersData';

      /**
       * @description
       */
      $rootScope.loading = true;

      /**
       * @description consolidated list of all owned players by a manager
       */
      $scope.allLeagues = null;

      /**
       * @description
       */
      $scope.updateAllManagerData = null;

      /**
       * @description
       */
      $scope.showLastAmount = 10;

      /**
       * @description
       */
      $scope.isCurrentMonth = function (selectedMonth, date) {
        var gameDate = $momentService.getDate(date),
          isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);
        return isBetween;
      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @description options for chart
       */
      var chartOptions = {
        axisX: {
          labelInterpolationFnc: function (value, index, axis) {
            var divider;
            if (axis.length < 8) {
              divider = 1;
            } else {
              divider = Math.ceil(axis.length / 16);
            }
            if (index % divider === 0) {
              return value;
            } else {
              return '';
            }
          }
        },
        axisY: {
          onlyInteger: true
        },
        lineSmooth: true,
        fullWidth: false,
        chartPadding: {
          right: 0
        },
        //low: 50,
        showPoint: true,
        height: 600,
        classNames: {
          chart: 'sick-chart-line ct-chart-line',
          label: 'sick-label ct-label',
          series: 'sick-series ct-series',
          line: 'sick-line ct-line'
        }
      };

      var responsiveOptions = [
        ['screen and (min-width: 641px) and (max-width: 1024px)', {
          lineSmooth: true,
          showPoint: false,
          fullWidth: true,
          height: 400,
          axisX: {
            showLabel: true,
            labelInterpolationFnc: function (value, index, axis) {
              if (index % 4 === 0) {
                return value;
              } else {
                return '';
              }
            }
          },
        }],
        ['screen and (max-width: 640px)', {
          lineSmooth: true,
          showPoint: false,
          fullWidth: true,
          height: 400,
          axisX: {
            showLabel: true,
            offsetX: 20,
            labelInterpolationFnc: function (value, index, axis) {
              if (index % 12 === 0) {
                return value;
              } else {
                return '';
              }
            }
          },
          axisY: {
            showLabel: true
          }
        }]
      ];

      /**
       * @description callback for when data is loaded
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        $scope.managersData = $scope.populateManagersData(result.data);
        console.log('syncDate:', result._lastSyncedOn);

        if ($momentService.isHoursAgo(result._lastSyncedOn)) {

          console.log('-- data is too old --');

          $rootScope.loading = false;

          $scope.startFireBase(function () {

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(result.data);

            // define selectedManager by managerId
            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            // TODO - fix, takes too long
            //$updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          $rootScope.loading = false;

          // define managerData on scope and $rootScope
          $scope.managerData = $scope.populateManagersData(result.data);

        }

        $timeout(function() {
          console.log('timeout:', currentMonth.monthName);
          $scope.changeMonth(currentMonth);
        }.bind($scope), 500);

      };

      $rootScope.$on('MONTH_CHANGED', function(e, month) {
        console.log('month change detected:', month.monthName);
        currentMonth = month;
        processChart();
      });

      /**
       * @description current month
       */
      var currentMonth = $scope.selectedMonth;

      /**
       * @description populates chart
       */
      var processChart = function () {

        console.log('processChart()');

        $('.ct-chart').empty();

        var gameDates = [];
        var seriesData = [];
        var chartKey = 'points';

        _.each($rootScope.managerData, function (manager) {

          var seriesDataObj = {};
          seriesDataObj.name = manager.managerName;
          seriesDataObj.data = [];

          _.each(manager.chartData, function (data) {

            if ($scope.isCurrentMonth(currentMonth, data.date)) {
              seriesDataObj.data.push(data[chartKey]);
              if (angular.isDefined(data.date)) gameDates.push(data.date);
            }

          });

          seriesData.push(seriesDataObj);
          gameDates = gameDates.concat(gameDates);

        });

        gameDates = _.unique(gameDates);
        gameDates = gameDates.sort(function (a, b) {
          return new Date(a).getTime() - new Date(b).getTime();
        });

        $scope.showLastAmount = gameDates.length;

        seriesData = _.map(seriesData, function(d) {
          if ($scope.showLastAmount < d.data.length) {
            return {
              name: d.name,
              data: d.data.splice(d.data.length - $scope.showLastAmount, d.data.length)
            }
          } else {
            return {
              name: d.name,
              data: d.data
            };
          }
        });

        //console.log('> data length', d.data.length);

        new Chartist.Line('.ct-chart', {
          labels: gameDates,
          series: seriesData
        }, chartOptions, responsiveOptions);

        var $chart = $('.ct-chart');

        var $toolTip = $chart
          .append('<div class="ct-tooltip"></div>')
          .find('.ct-tooltip')
          .hide();

        $chart.on('mouseenter', '.ct-point', function () {
          var $point = $(this),
            value = $point.attr('ct:value'),
            seriesName = $point.parent().attr('ct:series-name');

          $toolTip.html('<b>' + seriesName + '</b> <br>' + value + ' ' + chartKey);
          $toolTip.show();
        });

        $chart.on('mouseleave', '.ct-point', function () {
          $toolTip.hide();
        });

        $chart.on('mousemove', function (event) {
          $toolTip.css({
            left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
            top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 40
          });
        });

      };

      /**
       * @description when managers http data is loaded
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {

        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.saveRoster();

      };

      var init = function () {

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {


          $scope.startFireBase(function (firebaseData) {

            console.log('load from firebase');
            loadData(firebaseData[$scope.dataKeyName]);

          });

        }

        $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

      };

      init();

    });

})();
