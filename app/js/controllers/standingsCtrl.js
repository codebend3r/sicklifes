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
          route: 'standings.overview'
        },
        {
          title: 'Latest Goals',
          route: 'standings.latestgoals'
        },
        {
          title: 'Charts',
          route: 'standings.charts'
        }
      ];

      /**
       * @description function to check
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
          console.log('name:', manager.managerName, manager);
          $scope.combinedLogs = $scope.combinedLogs.concat(manager.filteredMonthlyGoalsLog
            .filter(function (log) {
              return log.goals;
            })
            .map(function (log) {
              log.date = new Date(log.datePlayed);
              return log;
            }));
          //$scope.combinedLogs = $scope.combinedLogs.concat(manager.monthlyGoalsLog);
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

        /////////////////////////////

      };

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        console.log('month change detected:', month.monthName);
        currentMonth = month;
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
       * @description init
       */
      var init = function () {

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('read from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('read from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          apiFactory.getApiData('managersData')
            .then(loadData);

        }

      };

      $state.current.name !== 'standings.charts' && init();

    });

})();
