/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $arrayFilter, $state, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $apiFactory, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('-- managersCtrl --');

      $rootScope.loading = true;

      $scope.goalsOnlyFilterOn = true;

      $scope.isActive = function() {
        console.log('> isActive');
      };

      /**
       * @description
       * @param selectedManager
       */
      $scope.changeManager = function (selectedManager) {
        console.log('changeManager to', selectedManager.managerName);
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });
      };

      /**
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

        $rootScope.loading = false;

        $scope.managersData = $rootScope.managersData.data;

        $scope.selectedManager = $rootScope.selectedManager;

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog;

        $rootScope.lastSyncDate = $scope.selectedManager._lastSyncedOn;

        $rootScope.source = 'firebase';

        if (angular.isDefined($scope.selectedManager._lastSyncedOn) && $momentService.isHoursAgo($scope.selectedManager._lastSyncedOn)) {

          console.log('-- data for', $scope.selectedManager.managerName, 'is old --');

          $scope.selectedManager.wildCardCount = 0;

          _.each($scope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
            if (angular.isDefined(player.status)) {
              console.log('status -->', player.playerName, player.status);
            }
          });

          //$scope.startFireBase(function () {
          //  $updateDataUtils.updateManagerData(onManagersRequestFinished, $scope.selectedManager);
          //});

        } else if ($momentService.isHoursAgo($scope.managerData._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.selectedManager.wildCardCount = 0;

          _.each($scope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
            if (angular.isDefined(player.status)) {
              console.log('status -->', player.playerName, player.status);
            }
          });

          //$scope.startFireBase(function () {
          //  $updateDataUtils.updateManagerData(onManagersRequestFinished, $scope.selectedManager);
          //});

        } else {

          console.log('-- data is up to date --');

          $scope.selectedManager.wildCardCount = 0;

          _.each($rootScope.selectedManager.players, function (player) {
            checkForWildCard(player, $scope.selectedManager);
            if (angular.isDefined(player.status)) {
              console.log('status -->', player.playerName, player.status);
            }
          });

        }

        // _.each($scope.selectedManager.players.sortBy('pickNumber'), function(p) {
        //   console.log(p.playerName, p.pickNumber);
        // });

        // if (angular.isUndefinedOrNull($localStorage[$scope.dataKeyName])) {
        //
        //   var saveObject = {
        //     _lastSyncedOn: $momentService.syncDate(),
        //     data: $rootScope.managerData
        //   };
        //
        //   $fireBaseService.saveToLocalStorage(saveObject, 'managersData');
        //
        // }

        //if (!$rootScope.fireBaseReady) {
        //  console.log('start firebase if not already initiated');
        //  $scope.startFireBase(function () {
        //    //noop
        //  });
        //}

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

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadData($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadData($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $apiFactory.getApiData('managersData')
            .then(loadData);

        }

      };

      init();

    });

})();
