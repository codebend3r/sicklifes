/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('standingsCtrl', function ($scope, $rootScope, $timeout, apiFactory, $state, $stateParams, fireBaseService, updateDataUtils, momentService, $localStorage) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        toState.name === 'standings.charts' && $timeout(processChart, 500);
      });

      /**
       * @description
       */
      $rootScope.loading = true;

      /**
       * @description consolidated list of all owned players by a manager
       */
      $scope.allLeagues = null;

      /**
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
        },
        {
          title: 'Charts',
          route: 'standings.charts',
          active: false
        }
      ];

      $scope.isActive = function(route){
        console.log($state.is(route))
        return $state.is(route);
      };

      /**
       * @description function to check current month
       */
      $scope.isCurrentMonth = function (selectedMonth, date) {
        var gameDate = momentService.getDate(date),
          isBetween = gameDate.isBetween(selectedMonth.range[0], selectedMonth.range[1]);
        return isBetween;
      };

      /**
       * @description update only the current manager data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;
        updateDataUtils.updateAllManagerData(function (data) {

          $rootScope.loading = false;
          console.log('managers updated', data);

        });

      };

      /**
       *
       * @param log
       * @returns {date}
       */
      $scope.theDate = function (log) {
        console.log(log.datePlayed);
        return new Date(log.datePlayed);
      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @description callback for when data is loaded
       */
      var loadData = function (result) {

        $rootScope.loading = false;

        $scope.managersData = $rootScope.managersData.data;

        $rootScope.lastSyncDate = result._lastSyncedOn;

        $rootScope.source = 'firebase';

        if (momentService.isHoursAgo($rootScope.managersData._lastSyncedOn)) {

          console.log('-- data is too old --');

          // TODO - fix, takes too long
          //updateDataUtils.updateAllManagerData(onManagersRequestFinished);

        } else {

          console.log('-- data is up to date --');

        }

        $scope.combinedLogs = [];

        _.each($scope.managersData, function (manager) {
          $scope.combinedLogs = $scope.combinedLogs.concat(manager.filteredMonthlyGoalsLog
            .filter(function (log) {
              return log.goals;
            })
            .map(function (log) {
              log.date = new Date(log.datePlayed);
              return log;
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
        // fireBaseService.saveToLocalStorage(saveObject, 'managersData');

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

      /**
       * @description current month
       */
      var currentMonth = $scope.selectedMonth;

      /**
       * @description when managers http data is loaded
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {

        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.saveRoster();

      };

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
          onlyInteger: true,
          low: 0
        },
        lineSmooth: false,
        fullWidth: false,
        chartPadding: {
          right: 0
        },
        showPoint: false,
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
          axisY: {
            onlyInteger: true,
            showLabel: true
          }
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
            onlyInteger: true,
            showLabel: true
          }
        }]
      ];

      /**
       * @description populates chart
       */
      var processChart = function () {

        console.log('---------------------');
        console.log('processChart');
        console.log('---------------------');

        $scope.loadingChart = false;

        $('.ct-chart').empty();

        var gameDates = [];
        var seriesData = [];
        var chartKey = 'stepPoints';

        _.each($rootScope.managersData.data, function (manager) {

          var seriesHashTable = {};
          var seriesDataObj = {};
          seriesDataObj.name = manager.managerName;
          seriesDataObj.data = [];

          console.log('manager name:', seriesDataObj.name);

          _.each(manager.chartData, function (data) {

            if ($scope.isCurrentMonth(currentMonth, data.date)) {
              if (angular.isDefined(seriesHashTable[data.date])) {
                seriesHashTable[data.date] += data[chartKey];
                //console.log(manager.managerName, 'exists, add', data[chartKey], _.keys(seriesHashTable).length);
              } else {
                seriesHashTable[data.date] = data[chartKey];
                //console.log(manager.managerName, 'new, add', data[chartKey], _.keys(seriesHashTable).length);
              }
              //console.log(manager.managerName, '| pushing >', data[chartKey]);
              if (angular.isDefined(data.date)) gameDates.push(data.date);
            }

          });

          //console.log(manager.managerName, 'seriesHashTable', seriesHashTable);
          //console.log(manager.managerName, 'seriesHashTable', _.keys(seriesHashTable).length);

          var chartStartValue = 0;

          _.each(seriesHashTable, function (obj) {

            seriesDataObj.data.push(chartStartValue);
            chartStartValue += obj;

          });

          seriesData.push(seriesDataObj);
          gameDates = gameDates.concat(gameDates);

        });

        gameDates = _.unique(gameDates);
        gameDates = gameDates.sort(function (a, b) {
          return new Date(a).getTime() - new Date(b).getTime();
        });

        console.log('date length', gameDates.length);

        $scope.showLastAmount = gameDates.length;

        // seriesData = _.map(seriesData, function(d) {
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

      /**
      * @description init
      */
      var init = function () {

       console.log('> init');

       if (angular.isDefined($rootScope.managersData)) {

         console.log('load from $rootScope');

         loadData($rootScope.managersData);

       } else if (angular.isDefined($localStorage.managersData)) {

         console.log('load from local storage');
         $rootScope.managersData = $localStorage.managersData;
         loadData($localStorage.managersData);

       } else {

         apiFactory.getApiData('managersData')
           .then(loadData);

       }

      };

       init();

    });

})();
