/**
 * Created by Bouse on 01/07/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $timeout, arrayFilter, updateDataUtils, $moment, momentService, $localStorage, apiFactory) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('-- managersCtrl --');
      console.log('$stateParams.managerId', $stateParams.managerId);

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
        $state.go($state.current, { managerId: selectedManagerName.toLowerCase() });
        //$window.location.reload();
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
       * @name checkForWildCard
       * @description computed function to determine manager wildcard count
       * @param player
       * @param manager
       */
      var checkForWildCard = function (player, manager) {

        // if player is not dropped then count on active roster
        if (player.status !== 'dropped' && angular.isDefined(manager) && (player.playedInChlgGames || player.playedInEuroGames)) {
          if (!player.playedInLigaGames && !player.playedInEPLGames && !player.playedInSeriGames) {
            manager.wildCardCount += 1;
          }
        }

      };

      /**
       * @name loadData
       * @description callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function (result) {

        $rootScope.loading = false;

        console.log('$stateParams.managerId', $stateParams.managerId);

        $scope.selectedManager = $rootScope.managersData.data[$stateParams.managerId];

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog
          .filter(function (log) {
            return log.goals;
          })
          .map(function (log) {
            log.date = new Date(log.datePlayed);
            return log;
          });

        $scope.selectedManagerName = $scope.selectedManager.managerName;

        console.log('-----------------------------');
        console.log($scope.selectedManagerName);
        console.log('-----------------------------');

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
          checkForWildCard(player, $scope.selectedManager);
        });

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
          $rootScope.managersData.data = result;
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

      /**
       * @name init
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

          var request = 'managersData';

          apiFactory.getApiData(request)
            .then(loadData);

        }

      };

      init();

    });

})();
