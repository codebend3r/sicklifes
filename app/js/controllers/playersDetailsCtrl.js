/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, $apiFactory, $location, $stateParams, $arrayMappers, $textManipulator, $objectUtils, $managersService, $momentService) {

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
       *
       * @type {{}}
       */
      var managersData = {};

      /**
       * call when firebase data has loaded
       * defines $scope.managersData
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        $rootScope.fireBaseReady = true;

        managersData = {
          chester: firebaseData.managersData.data.chester,
          frank: firebaseData.managersData.data.frank,
          dan: firebaseData.managersData.data.dan,
          justin: firebaseData.managersData.data.justin,
          mike: firebaseData.managersData.data.mike,
          joe: firebaseData.managersData.data.joe
        };

        if (angular.isDefined($rootScope.firebaseData[$scope.dataKeyName].data)) {

          $scope.allPlayers = $rootScope.firebaseData[$scope.dataKeyName];
          console.log('loaded allPlayersIndex:', _.keys($scope.allPlayers.data).length);

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
          $rootScope.loading = false;

          console.log($scope.player);

          // if (angular.isDefined($scope.player.chlgCompleteLog)) {
          //   console.log('$scope.player.chlgCompleteLog', $scope.player.chlgCompleteLog);
          // }

        } else {

          console.log('not found player and/or is out of date');

          $scope.player.id = $stateParams.playerId;
          $scope.player = $objectUtils.playerResetGoalPoints($scope.player);

          $apiFactory.getPlayerProfile('soccer', $scope.player.id)
            .then(function (result) {
              $scope.player.playerName = result.data.full_name;
              return $arrayMappers.playerInfo($scope.player, result);
            })
            .then($arrayMappers.playerMapPersonalInfo.bind(this, $scope.player))
            .then($arrayMappers.playerGamesLog.bind(this, { player: $scope.player, manager: null }))
            .then(function (result) {

              console.log('-- DONE --');
              console.log('>', $scope.player);
              console.log($scope.player.playerName);
              if (angular.isDefined($scope.player.chlgCompleteLog)) {
                console.log('$scope.player.chlgCompleteLog', $scope.player.chlgCompleteLog);
              }
              $scope.player = result;
              $scope.player._lastSyncedOn = $momentService.syncDate();
              $rootScope.loading = false;

              $scope.saveToIndex($stateParams.playerId, $scope.player);

            });

        }

      };

      /**
       * init function
       */
      var init = function () {

        $scope.dataKeyName = 'allPlayersIndex';
        $scope.startFireBase(fireBaseLoaded);

      };

      init();

    });

})();
