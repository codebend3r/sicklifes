/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, $apiFactory, $location, $stateParams, $arrayMappers, $textManipulator, $objectUtils, $managersService, $updateDataUtils, $momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

      /**
       * player
       */
      $scope.player = {};

      /**
       * league images
       */
      $scope.leagueImages = $textManipulator.leagueImages;

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * call when firebase data has loaded
       * defines $scope.managersData
       * @param result
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        // define managerData on scope and $rootScope
        $scope.populateManagersData(result.data);

        if (angular.isDefined($rootScope.allPlayersIndex.data)) {

          $scope.allPlayers = $rootScope.allPlayersIndex;

        }

        //////////////////

        findPlayerByID();

      };

      /**
       * find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        var foundPlayer = false;

        if (angular.isDefined($scope.allPlayers) && angular.isDefined($scope.allPlayers.data) && angular.isDefined($scope.allPlayers.data[$stateParams.playerId]) && !Array.isArray($scope.allPlayers)) {

          $scope.player = $scope.allPlayers.data[$stateParams.playerId];
          foundPlayer = true;

        } else {

          _.some(managersData, function (manager) {

            if (angular.isDefined(manager.players[$stateParams.playerId])) {

              $scope.player = manager.players[$stateParams.playerId];
              foundPlayer = true;
              return true;

            }

          });

        }

        if (foundPlayer && angular.isDefined($scope.player._lastSyncedOn) && !$momentService.isHoursAgo($scope.player._lastSyncedOn)) {

          console.log('foundPlayer and is up to date', $scope.player.playerName);
          requestUpdateOnPlayer();

        } else {

          console.log('not found player and/or is out of date');
          requestUpdateOnPlayer();

        }

      };

      var requestUpdateOnPlayer = function () {

        $scope.player.id = $stateParams.playerId;
        $scope.player = $objectUtils.playerResetGoalPoints($scope.player);

        $apiFactory.getPlayerProfile('soccer', $scope.player.id)
          .then(function (result) {
            $scope.player.playerName = result.data.full_name;
            return $arrayMappers.playerInfo($scope.player, result);
          })
          .then($arrayMappers.playerMapPersonalInfo.bind(this, $scope.player))
          .then($arrayMappers.playerGamesLog.bind(this, {player: $scope.player, manager: null}))
          .then(function (result) {

            $scope.player = result;
            $scope.player._lastSyncedOn = $momentService.syncDate();

            console.log('-- DONE --');
            console.log('>', $scope.player);
            //console.log($scope.player.playerName);
            //$scope.saveToIndex($stateParams.playerId, $scope.player);

            $rootScope.loading = false;

          });

      };

      /**
       * init function
       */
      var init = function () {

        $updateDataUtils.updateCoreData(function () {

          $apiFactory.getApiData('allPlayersIndex')
            .then(loadData);

        });

      };

      init();

    });

})();
