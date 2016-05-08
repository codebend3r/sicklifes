/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $rootScope, $log, $timeout, apiFactory, $state, $stateParams, fireBaseService, updateDataUtils, momentService, managerData) {

      $log.debug('--> standingsCtrl');

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * @name loading
       * @description
       */
      $rootScope.loading = true;

      /**
       * @name allLeagues
       * @description consolidated list of all owned players by a manager
       */
      $scope.allLeagues = null;

      /**
       * @name tabData
       * @description tabs data
       */
      $scope.tabData = [
        {
          title: 'Overview',
          route: 'standings.overview',
          active: false
        },
        {
          title: 'Latest Goals',
          route: 'standings.latestgoals',
          active: false
        }
        //{
        //  title: 'Charts',
        //  route: 'standings.charts',
        //  active: false
        //}
      ];

      /**
       * @name isCurrentMonth
       * @description function to check current month
       */
      $scope.isCurrentMonth = function (selectedMonth, date) {
        var gameDate = momentService.getDate(date);
        return gameDate.isBetween(new Date(selectedMonth.range[0]).toISOString(), new Date(selectedMonth.range[1]).toISOString());
      };

      /**
       * @name updateAllManagerData
       * @description update only the current manager data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;
        updateDataUtils.updateAllManagerData(function (data) {

          $rootScope.loading = false;
          $log.debug('managers updated', data);

        });

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @name loadData
       * @description callback for when data is loaded
       */
      var loadData = function () {

        $rootScope.loading = false;

        $scope.managerData = managerData.data;

        // _.each($scope.managerData, function(m, key) {
        //
        //   m.filteredMonthlyGoalsLog = gameLogs.data[key].filteredMonthlyGoalsLog;
        //   m.monthlyGoalsLog = gameLogs.data[key].monthlyGoalsLog;
        //
        // });

        $rootScope.lastSyncDate = managerData._lastSyncedOn;
        $rootScope.source = 'firebase';

        if (momentService.isHoursAgo(managerData._lastSyncedOn)) {
          $log.debug('-- data is too old --');
        } else {
          $log.debug('-- data is up to date --');
        }

        $scope.combinedLogs = [];

        // _.each($scope.managerData, function (manager) {
        //   $scope.combinedLogs = $scope.combinedLogs.concat(manager.filteredMonthlyGoalsLog
        //     .filter(function (log) {
        //       return log.goals;
        //     }));
        // });

        $rootScope.$emit('STANDINGS_READY');
        //setTimeout(processChart, 1000);

        /////////////////////////////

      };

      $rootScope.$on('STANDINGS_READY', function () {
        $state.current.name === 'standings.charts' && $timeout(processChart, 500);
      });

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        $log.debug('month change detected:', month.monthName);
        currentMonth = month;
        $state.current.name === 'standings.charts' && $timeout(processChart, 500);
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        toState.name === 'standings.charts' && $timeout(processChart, 500);
      });

      /**
       * @name currentMonth
       * @description current month
       */
      var currentMonth = $scope.selectedMonth;

      /**
       * @name onManagersRequestFinished
       * @description when managers http data is loaded
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {

        $log.debug('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.saveRoster();

      };

      /**
       * @name processChart
       * @description populates chart
       */
      var processChart = function () {

        $log.debug('---------------------');
        $log.debug('processChart', currentMonth.monthName);
        $log.debug('---------------------');

        $scope.loadingChart = false;

        $('.ct-chart').empty();

        var gameDates = [];
        var seriesData = [];
        var chartKey = 'stepPoints';
        var seriesHashTable = {};

        _.each(managerData.data, function (manager) {

          _.each(manager.chartData, function (data) {

            if ($scope.isCurrentMonth(currentMonth, data.date) && !_.isDefined(seriesHashTable[data.date])) {
              seriesHashTable[data.date] = 0;
            }

          });

        });

        $log.debug(seriesHashTable, _.keys(seriesHashTable).length);

        _.each(managerData.data, function (manager) {

          var seriesDataObj = {};
          seriesDataObj.name = manager.managerName;
          seriesDataObj.data = [];

          $log.debug('name:', seriesDataObj.name);

          seriesHashTable = _.map(seriesHashTable, function (data, key) {
            $log.debug(data, key);
            return data;
          });

          $log.debug('seriesHashTable reset', seriesHashTable);

          _.each(manager.chartData, function (data) {

            if ($scope.isCurrentMonth(currentMonth, data.date)) {
              seriesHashTable[data.date] += data[chartKey];
              if (angular.isDefined(data.date)) gameDates.push(data.date);
            }

          });

          var chartStartValue = 0;

          _.each(seriesHashTable, function (points) {

            seriesDataObj.data.push(chartStartValue);
            chartStartValue += points;

          });

          $log.debug(seriesDataObj.name, seriesDataObj.data);

          seriesData.push(seriesDataObj);
          gameDates = gameDates.concat(gameDates);

        });

        gameDates = _.unique(gameDates);
        gameDates = gameDates.sort(function (a, b) {
          return new Date(a).getTime() - new Date(b).getTime();
        });

        $log.debug('seriesData.length:', seriesData.length);
        //$log.debug('gameDates.length:', gameDates.length);

        $scope.showLastAmount = gameDates.length;

        // seriesData = _.map(seriesData, function(d) {
        //   $log.debug('d.data.length:', d.data.length);
        //   if ($scope.showLastAmount < d.data.length) {
        //     $log.debug('cutting off', Math.abs($scope.showLastAmount - d.data.length));
        //     return {
        //       name: d.name,
        //       data: d.data.splice(d.data.length - $scope.showLastAmount, d.data.length)
        //     }
        //   } else {
        //     return {
        //       name: d.name,
        //       data: d.data
        //     };
        //   }
        // });

        new Chartist.Line('.ct-chart', {
          labels: gameDates,
          series: seriesData
        }, chartOptions, responsiveOptions);

        var $chart = $('.ct-chart');

        var $toolTip = $chart
          .append('<div class="ct-tooltip"></div>')
          .find('.ct-tooltip')
          .hide();

      };

      loadData();


    });

})();
