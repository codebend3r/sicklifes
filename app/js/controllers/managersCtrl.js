/**
 * Created by Bouse on 01/07/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $timeout, $moment, arrayFilter, momentService, transferDates, managersData, updateDataUtils) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.goalsOnlyFilterOn = true;

      /**
       * @name changeManager
       * @description
       * @param selectedManagerName
       */
      $scope.changeManager = function (selectedManagerName) {
        $rootScope.loading = true;
        $state.go($state.current, {managerId: selectedManagerName.toLowerCase()});
      };

      /**
       * @name tabData
       * @description tabs data
       */
      $scope.tabData = [
        {
          title: 'Overview',
          route: 'managers.overview'
        },
        {
          title: 'Game Logs',
          route: 'managers.gamelogs'
        }
      ];

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @name loadData
       * @description callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function () {

        console.log('managersCtrl - loadData()');

        if (angular.isUndefinedOrNull($stateParams.managerId) || _.isEmpty($stateParams.managerId)) return;

        $rootScope.loading = false;

        $scope.selectedManager = managersData.data[$stateParams.managerId];

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog
          .filter(function (log) {
            return log.goals;
          });

        $scope.selectedManagerName = $scope.selectedManager.managerName;

        $rootScope.lastSyncDate = $scope.selectedManager._lastSyncedOn;
        $rootScope.source = 'firebase';

        if (angular.isDefined($scope.selectedManager._lastSyncedOn) && momentService.isHoursAgo($scope.selectedManager._lastSyncedOn)) {

          console.log('-- data for', $scope.selectedManager.managerName, 'is old --');

        } else if (momentService.isHoursAgo($scope.managersData._lastSyncedOn)) {

          console.log('-- data is too old --');

        } else {

          console.log('-- data is up to date --');

        }

        $scope.selectedManager.wildCardCount = 0;

        _.each($scope.selectedManager.players, function (player) {
          $scope.checkForWildCard(player, $scope.selectedManager);
        });

      };

      /**
       * @name updateAllManagerData
       * @description update all managers data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;

        updateDataUtils.updateAllManagerData(managersData, function (result) {

          $scope.loading = false;
          //$scope.managersData = result;
          managersData.data = result;
          $scope.saveRoster();

        });

      };

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        console.log('month change detected:', month.monthName);
        $scope.currentMonthLog = _.chain($scope.selectedManager.filteredMonthlyGoalsLog)
          .flatten(true)
          .filter(arrayFilter.filterOnMonth.bind($scope, month))
          .value();
      });

      loadData();

    });

})();
