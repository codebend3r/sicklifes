/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $updateDataUtils, $fireBaseService, $moment, $momentService, $localStorage, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      console.log('-- managersCtrl --');

      $rootScope.loading = true;

      /**
       * @description
       * @param selectedManager
       */
      $scope.changeManager = function (selectedManager) {

        //$scope.selectedManager = selectedManager;
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });

      };

      /**
       * @description tabs data
       */
      $scope.tabData = [
        {
          heading: 'Overview',
          route: 'managers.overview'
        },
        {
          heading: 'Game Logs',
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

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        console.log('syncDate:', result._lastSyncedOn);

        if ($momentService.isHourAgo(result._lastSyncedOn)) {

          console.log('-- data is too old --');

          $scope.startFireBase(function () {

            // tell firebase it is ready to be updated
            //$rootScope.fireBaseReady = true;

            // define managerData on scope and $rootScope
            $scope.managerData = $scope.populateManagersData(result.data);

            // define the current manager
            $scope.chooseManager($stateParams.managerId);

            // define selectedManager by managerId
            $scope.selectedManager = $scope.managerData[$stateParams.managerId];

            $scope.selectedManager.wildCardCount = 0;

            _.each($scope.selectedManager.players, function (player) {
              checkForWildCard(player, $scope.selectedManager);
            });

            $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

          });

        } else {

          console.log('-- data is up to date --');

          // tell firebase it is ready to be updated
          $rootScope.loading = false;

          // define managerData on scope and $rootScope
          $scope.managerData = $scope.populateManagersData(result.data);

          // define the current manager
          $scope.chooseManager($stateParams.managerId);

          // define selectedManager by managerId
          $scope.selectedManager = $scope.managerData[$stateParams.managerId ? $stateParams.managerId : 'chester'];

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
        $scope.managerData = $scope.populateManagersData(managerData);

        $scope.saveRoster();
        init();

        //$scope.chooseManager($stateParams.managerId);

      };

      /**
       * @description
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;
        $updateDataUtils.updateAllManagerData(onManagersRequestFinished);

      };

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

          $scope.startFireBase(function (firebaseData) {

            console.log('load from firebase');
            loadData(firebaseData[$scope.dataKeyName]);

          });

        }

      };

      init();

    });

})();
