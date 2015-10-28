/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $arrayFilter, $state, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('-- managersCtrl --');

      $rootScope.loading = true;

      var managerId = $stateParams.managerId ? $stateParams.managerId : 'chester';

      $scope.goalsOnlyFilterOn = true;

      /**
       * @description
       * @param selectedManager
       */
      $scope.changeManager = function (selectedManager) {

        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });

      };

      /**
       * @description tabs data
       */
      $scope.tabData = [
        {
          title: 'Overview',
          route: 'managers.overview',
          active: true
        },
        {
          title: 'Game Logs',
          route: 'managers.gamelogs',
          active: false
        }
      ];

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @description computed function to determine manager wildcard count
       * @param player
       * @param manager
       */
      var checkForWildCard = function (player, manager) {

        // if player is not dropped then count on active roster
        if (player.status !== 'dropped'
          && angular.isDefined(manager)
          || player.playedInChlgGames
          || player.playedInEuroGames) {

          if (!player.playedInLigaGames && !player.playedInEPLGames && !player.playedInSeriGames) {
            manager.wildCardCount += 1;
          }
        }

      };

      /**
       * @description callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        // define managerData on scope and $rootScope
        $scope.populateManagersData(result.data);

        // define the current manager
        $scope.chooseManager(managerId);

        // define selectedManager by managerId
        $scope.selectedManager = $scope.managerData[managerId];

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog;

        if (angular.isDefined($scope.selectedManager._lastSyncedOn) && $momentService.isHoursAgo($scope.selectedManager._lastSyncedOn)) {

          console.log('-- data for', $scope.selectedManager.managerName, 'is old --');

          $rootScope.loading = false;

          $scope.selectedManager.wildCardCount = 0;

          _.each($scope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
          });

          $scope.startFireBase(function () {
            //$updateDataUtils.updateManagerData(onManagersRequestFinished, $scope.selectedManager);
          });

        } else if ($momentService.isHoursAgo($scope.managerData._lastSyncedOn)) {

          console.log('-- data is too old --');

          $rootScope.loading = false;

          $scope.selectedManager.wildCardCount = 0;

          _.each($scope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
          });

          $scope.startFireBase(function () {
            //$updateDataUtils.updateManagerData(onManagersRequestFinished, $scope.selectedManager);
          });

        } else {

          console.log('-- data is up to date --');

          // tell firebase it is ready to be updated
          $rootScope.loading = false;

          $scope.selectedManager.wildCardCount = 0;

          _.each($scope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
          });

        }

        if (!$rootScope.fireBaseReady) {
          console.log('start firebase');
          $scope.startFireBase(function () {
            //noop
          });
        }

      };

      /**
       * @description
       * @param managerData
       */
      var onManagersRequestFinished = function (managerData) {

        console.log('onManagersRequestFinished');
        $rootScope.loading = false;
        $scope.managerData[managerId] = managerData;
        $scope.selectedManager = managerData;
        $scope.saveRoster();

      };

      var onAllManagersRequestFinished = function (managersData) {

        $rootScope.loading = false;
        $scope.managerData = managersData;
        $rootScope.managerData = managersData;
        //$scope.saveRoster();
        console.log('$scope.managerData:', $scope.managerData);

      };

      /**
       * @description update only the current manager data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;
        $updateDataUtils.updateAllManagerData(onAllManagersRequestFinished);

      };


      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        console.log('month change detected:', month.monthName);
        $scope.currentMonthLog = _.chain($scope.selectedManager.filteredMonthlyGoalsLog)
          .flatten(true)
          .filter($arrayFilter.filterOnMonth.bind($scope, month))
          .value();
      });

      /**
       * @description init
       */
      var init = function () {

        $scope.dataKeyName = 'managersData';

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');

          $scope.startFireBase(function (firebaseData) {
            loadData(firebaseData[$scope.dataKeyName]);
          });

        }

      };

      init();

    });

})();
