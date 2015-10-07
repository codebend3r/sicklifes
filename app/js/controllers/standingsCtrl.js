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

      $rootScope.loading = true;

      /**
       * @description consolidated list of all owned players by a manager
       */
      $scope.allLeagues = null;

      /**
       *
       */
      $scope.updateAllManagerData = null;

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

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

        setTimeout(processChart, 500);
      };

      /**
       *
       */
      var processChart = function () {

        var gameDates = [];
        var seriesData = [];

        _.each($rootScope.managerData, function (manager) {

          var managerGoals = [];
          var totalGoals = 0;

          _.each(manager.filteredMonthlyGoalsLog, function (game) {

            gameDates.push(game.datePlayed);

            console.log('game:', game);

            if (game.goalsScored !== 0) {
              totalGoals += game.goalsScored;
              managerGoals.push(totalGoals);
            }

          });

          seriesData.push({
            name: manager.managerName,
            data: managerGoals
          });

        });

        gameDates = _.unique(gameDates);
        gameDates = gameDates.sort(function (a, b) {
          return new Date(a).getTime() - new Date(b).getTime();
        });

        new Chartist.Line('.ct-chart', {
            labels: gameDates,
            series: seriesData
          },
          {
            axisX: {
              labelInterpolationFnc: function (value, index) {
                if (index % 5 === 0) {
                  return value;
                } else {
                  return '';
                }
              }
            },
            axisY: {
              labelInterpolationFnc: function (value, index) {
                if (index % 2 === 0) {
                  return value;
                } else {
                  return '';
                }
              }
            },
            lineSmooth: true,
            fullWidth: false,
            showPoint: true,
            height: 600,
            classNames: {
              chart: 'sick-chart-line ct-chart-line',
              label: 'sick-label ct-label',
              series: 'sick-series ct-series',
              line: 'sick-line ct-line'
            }
          });

        var $chart = $('.ct-chart');

        var $toolTip = $chart
          .append('<div class="ct-tooltip"></div>')
          .find('.ct-tooltip')
          .hide();


        $chart.on('mouseenter', '.ct-point', function () {
          var $point = $(this),
            value = $point.attr('ct:value'),
            seriesName = $point.parent().attr('ct:series-name');

          $toolTip.html('<b>' + seriesName + '</b> <br>' + value + ' goals');
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

      document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM loaded');
        processChart();
      });

      init();

    });

})();
