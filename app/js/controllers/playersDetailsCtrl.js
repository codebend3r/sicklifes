/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, apiFactory, $location, $stateParams, arrayMappers, textManipulator, objectUtils, managersService, updateDataUtils, momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

      /**
       * @description player
       */
      $scope.player = {};

      /**
       * @description league images
       */
      $scope.leagueImages = textManipulator.leagueImages;

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * call when firebase data has loaded
       * @description defines $scope.managersData
       * @param result
       */
      var loadData = function (result) {

        $scope.managersData = $rootScope.managersData.data;

        // if (angular.isDefined($rootScope.allPlayersIndex)) {
        //   $scope.allPlayers = $rootScope.allPlayersIndex;
        // }

        //////////////////

        findPlayerByID();

      };

      /**
       * @description find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        var foundPlayer = false;

        // check source
        if (angular.isDefined($scope.allPlayers) && angular.isDefined($scope.allPlayers.data) && angular.isDefined($scope.allPlayers.data[$stateParams.playerId]) && !Array.isArray($scope.allPlayers)) {

          $scope.player = $scope.allPlayers.data[$stateParams.playerId];
          foundPlayer = true;

        } else {

          _.some($scope.managersData, function (manager) {

            if (angular.isDefined(manager.players[$stateParams.playerId])) {
              $scope.player = manager.players[$stateParams.playerId];
              foundPlayer = true;
              return true;
            }

          });

        }

        // check the data of the source data
        if (foundPlayer && angular.isDefined($scope.player._lastSyncedOn) && !momentService.isHoursAgo($scope.player._lastSyncedOn)) {

          console.log('foundPlayer and is up to date', $scope.player.playerName);
          requestUpdateOnPlayer();

        } else {

          console.log('not found player and/or is out of date');
          requestUpdateOnPlayer();

        }

      };

      /**
       * @description
       */
      var requestUpdateOnPlayer = function () {

        if (angular.isUndefinedOrNull($stateParams.playerId)) {
          throw new Error('$stateParams.playerId was not defined, don\'t do that');
        }

        $scope.matchingManager = null;

        $scope.player = objectUtils.playerResetGoalPoints($scope.player);
        $scope.player.id = $stateParams.playerId;

        _.each($rootScope.managersData.data, function (manager) {

          if (!angular.isUndefinedOrNull(manager.players[$stateParams.playerId])) {
            console.log('manager found', manager.managerName);
            $scope.matchingManager = manager;
          }

        });

        apiFactory.getPlayerProfile('soccer', $stateParams.playerId)
          .then(arrayMappers.playerInfo.bind(this, $scope.player))
          .then(arrayMappers.playerMapPersonalInfo.bind(this, $scope.player))
          .then(arrayMappers.playerGamesLog.bind(this, {
            player: $scope.player,
            manager: $scope.matchingManager
          }))
          .then(function (result) {

            $scope.player = result;
            $scope.player._lastSyncedOn = momentService.syncDate();

            $rootScope.loading = false;

            //$scope.saveToPlayerIndex($stateParams.playerId, $scope.player);

          });

      };

      /**
       * @description init function
       */
      var init = function () {

        updateDataUtils.updateCoreData(loadData);

      };

      init();

    });

})();
