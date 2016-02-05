/**
 * Created by Bouse on 01/07/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $timeout, $moment, arrayFilter, momentService, transferDates, managersData) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('-- managersCtrl --');

      $rootScope.loading = true;

      $scope.goalsOnlyFilterOn = true;

      $scope.managersList = ['Chester', 'Frank', 'Joe', 'Justin', 'Dan', 'Mike'];

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

        //_.each(managersData.data, function (manager) {
        //
        //  _.each(manager.players, function (player) {
        //
        //    if (player.pickNumber === 25) {
        //      player.dateOfTransaction = transferDates.transfers.round1.date;
        //    } else if (player.pickNumber === 26) {
        //      player.dateOfTransaction = transferDates.transfers.round2.date;
        //    } else if (player.pickNumber === 27) {
        //      player.dateOfTransaction = transferDates.transfers.round3.date;
        //    } else {
        //      if (player.status === 'drafted') {
        //        player.dateOfTransaction = transferDates.leagueStart.date;
        //      }
        //    }
        //
        //  });
        //
        //});

        var fixPickNumber = false;

        if (fixPickNumber) {

          var indexPick = 1;
          var sortedArray = [];

          _.each($scope.selectedManager.players, function (p) {
            sortedArray.push(p);
          });

          sortedArray.sort(function (a, b) {
            return a.pickNumber - b.pickNumber;
          });

          _.each(sortedArray, function (p) {
            console.log(p.playerName, p.pickNumber, 'to', indexPick);
            $scope.selectedManager.players[p.id].pickNumber = indexPick;
            indexPick += 1;
          });

        }

      };

      /**
       * @name updateAllManagerData
       * @description update all managers data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;

        updateDataUtils.updateAllManagerData(function (result) {

          $rootScope.loading = false;
          $scope.managersData = result;
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
