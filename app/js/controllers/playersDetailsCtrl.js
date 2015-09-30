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

      $scope.dataKeyName = 'allPlayersIndex';

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

        if (angular.isDefined(firebaseData[$scope.dataKeyName].data)) {

          $scope.allPlayers = firebaseData[$scope.dataKeyName];

          console.log('loaded allPlayersIndex:', _.keys($scope.allPlayers.data).length);

          if (angular.isDefined($scope.checkYesterday(firebaseData[$scope.dataKeyName]._lastSyncedOn)) && $scope.checkYesterday(firebaseData[$scope.dataKeyName]._lastSyncedOn)) {

            console.log('-- data is too old --');

          } else {

            console.log('-- data is up to date --');

          }
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

        if (foundPlayer) {

          console.log('foundPlayer:', $scope.player.playerName);
          $rootScope.loading = false;
          saveToIndex();

        } else {

          console.log('not found player, start searching');

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
              console.log($scope.player.id, '|', $scope.player.playerName);
              console.log($scope.player);
              $scope.player = result;
              $rootScope.loading = false;
              saveToIndex();
            });

        }

      };

      var profileLeagueSlug;

      var saveToIndex = function () {

        $scope.allPlayers = $scope.allPlayers || {};
        $scope.allPlayers.data[$stateParams.playerId] = $scope.player;

        $scope.allPlayers._lastSyncedOn = $momentService.syncDate();

        console.log('saving allPlayersIndex:', _.keys($scope.allPlayers.data).length);

        $scope.saveToFireBase($scope.allPlayers, $scope.dataKeyName);

      };

      /**
       * init function
       */
      var init = function () {

        $scope.startFireBase(fireBaseLoaded);

      };

      init();

    });

})();
