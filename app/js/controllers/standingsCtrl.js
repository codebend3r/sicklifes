/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $rootScope, $timeout, apiFactory, $state, $stateParams, fireBaseService, updateDataUtils, momentService, managerData) {

      console.log('--> standingsCtrl');

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
          console.log('managers updated', data);

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

        $rootScope.lastSyncDate = managerData._lastSyncedOn;

        $rootScope.source = 'firebase';

        if (momentService.isHoursAgo(managerData._lastSyncedOn)) {

          console.log('-- data is too old --');

          // TODO - fix, takes too long
          //updateDataUtils.updateAllManagerData(onManagersRequestFinished);

        } else {

          console.log('-- data is up to date --');

        }

        $scope.combinedLogs = [];

        _.each($scope.managerData, function (manager) {
          $scope.combinedLogs = $scope.combinedLogs.concat(manager.filteredMonthlyGoalsLog
            .filter(function (log) {
              return log.goals;
            }));
        });

        // $scope.startFireBase(function () {
        //   console.log('firebase ready');
        // });

        // var saveObject = {
        //   _lastSyncedOn: momentService.syncDate(),
        //   data: $rootScope.managerData
        // };
        //
        // fireBaseService.saveToLocalStorage(saveObject, 'managerData');

        $rootScope.$emit('STANDINGS_READY');
        //setTimeout(processChart, 1000);

        /////////////////////////////

      };

      $rootScope.$on('STANDINGS_READY', function () {
        $state.current.name === 'standings.charts' && $timeout(processChart, 500);
      });

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        console.log('month change detected:', month.monthName);
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

        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.saveRoster();

      };

      /**
       * @name processChart
       * @description populates chart
       */
      var processChart = function () {

        console.log('---------------------');
        console.log('processChart', currentMonth.monthName);
        console.log('---------------------');

        $scope.loadingChart = false;

        $('.ct-chart').empty();

        var gameDates = [];
        var seriesData = [];
        var chartKey = 'stepPoints';
        var seriesHashTable = {};

        _.each(managerData.data, function (manager) {

          _.each(manager.chartData, function (data) {

            if ($scope.isCurrentMonth(currentMonth, data.date) && angular.isUndefinedOrNull(seriesHashTable[data.date])) {
              seriesHashTable[data.date] = 0;
            }

          });

        });

        console.log(seriesHashTable, _.keys(seriesHashTable).length);

        _.each(managerData.data, function (manager) {

          var seriesDataObj = {};
          seriesDataObj.name = manager.managerName;
          seriesDataObj.data = [];

          console.log('name:', seriesDataObj.name);

          seriesHashTable = _.map(seriesHashTable, function (data, key) {
            console.log(data, key);
            return data;
          });

          console.log('seriesHashTable reset', seriesHashTable);

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

          console.log(seriesDataObj.name, seriesDataObj.data);

          seriesData.push(seriesDataObj);
          gameDates = gameDates.concat(gameDates);

        });

        gameDates = _.unique(gameDates);
        gameDates = gameDates.sort(function (a, b) {
          return new Date(a).getTime() - new Date(b).getTime();
        });

        console.log('seriesData.length:', seriesData.length);
        //console.log('gameDates.length:', gameDates.length);

        $scope.showLastAmount = gameDates.length;

        // seriesData = _.map(seriesData, function(d) {
        //   console.log('d.data.length:', d.data.length);
        //   if ($scope.showLastAmount < d.data.length) {
        //     console.log('cutting off', Math.abs($scope.showLastAmount - d.data.length));
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

        // $chart.on('mouseenter', '.ct-point', function () {
        //   var $point = $(this),
        //     value = $point.attr('ct:value'),
        //     seriesName = $point.parent().attr('ct:series-name');
        //
        //   $toolTip.html('<b>' + seriesName + '</b> <br>' + value + ' ' + 'POINTS');
        //   $toolTip.show();
        // });
        //
        // $chart.on('mouseleave', '.ct-point', function () {
        //   $toolTip.hide();
        // });
        //
        // $chart.on('mousemove', function (event) {
        //   $toolTip.css({
        //     left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
        //     top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 40
        //   });
        // });

        // $timeout(function() {
        //
        //   debugger;
        //   console.log($('.ct-chart .ct-series[ct:series-name]'));
        //   console.log($('.ct-chart .ct-series[ct]'));
        //   console.log($('.ct-chart .ct-series[series-name]'));
        //   //console.log($('.ct-chart .ct-series["ct:series-name"="Frank"]'));
        //
        //   _.each($('.ct-chart .ct-series'), function(ele, index) {
        //
        //     var currentAttr = $(ele).attr('ct:series-name');
        //     console.log(index, currentAttr);
        //
        //   });
        // }, 500);

      };

      loadData();


    });

})();
