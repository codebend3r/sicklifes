/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, $apiFactory, $location, $stateParams, $arrayMappers, $textManipulator, $objectUtils, $managersService, $momentService, $fireBaseService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'playerPoolData';

      $rootScope.loading = true;

      /*
       * TODO
       */
      $scope.tableHeader = [
        {
          text: 'Opponent'
        },
        {
          text: 'G'
        },
        {
          text: 'Final Score'
        },
        {
          text: 'League'
        },
        {
          text: 'Date Played'
        }
      ];

      /*
       * player
       */
      $scope.player = {};

      /**
       * league images
       */
      $scope.leagueImages = $textManipulator.leagueImages;

      $scope.getAllGameLogs = function () {

        console.log('get all game logs');

      };

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * saves current data to firebase
       */
      var saveToFireBase = function () {

        console.log('////////////////////////////////////');
        console.log('managersData', managersData);
        console.log('////////////////////////////////////');

        var saveObject = {
          _syncedFrom: 'playerDetailsCtrl',
          _lastSyncedOn: $dateService.syncDate(),
          chester: managersData.chester,
          frank: managersData.frank,
          dan: managersData.dan,
          justin: managersData.justin,
          mike: managersData.mike,
          joe: managersData.joe
        };

        $fireBaseService.saveToFireBase(saveObject, playerPoolData);

      };

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

        var playerPoolData = firebaseData[dataKeyName];
        $scope.allPlayers = playerPoolData.allPlayers;

        managersData = {
          chester: firebaseData.managersData.chester,
          frank: firebaseData.managersData.frank,
          dan: firebaseData.managersData.dan,
          justin: firebaseData.managersData.justin,
          mike: firebaseData.managersData.mike,
          joe: firebaseData.managersData.joe
        };

        //////////////////

        if ($scope.checkYesterday(playerPoolData._lastSyncedOn)) {

          console.log('-- data is too old --');

        } else {

          console.log('-- data is up to date --');

        }

        findPlayerByID();

      };

      /**
       * find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        var foundPlayer = false;

        _.some(managersData, function (manager) {

          if (angular.isDefined(manager.players[$stateParams.playerId])) {

            $scope.player = manager.players[$stateParams.playerId];
            foundPlayer = true;
            return true;

          }

        });

        if (foundPlayer) {

          console.log('foundPlayer:', $scope.player);
          $rootScope.loading = false;

        } else {

          var manager = managersData[$scope.player.managerName] || null;

          $apiFactory.getPlayerProfile($scope.player.leagueSlugs, id)
            .then(function (result) {

              var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

              //$scope.player.id = result.data.id;

              /*if (result.data.teams[0]) {
                // url for team logo
                $scope.player.teamLogo = result.data.teams[0].sportsnet_logos.large;
                // set latest teamName to whatever the first value is in the stack
                $scope.player.teamName = $textManipulator.teamNameFormatted(result.data.teams[0].full_name);
              }*/

              // url for $scope.player image
              //$scope.player.playerImage = result.data.headshots.original;

              // returns a concat string with all valid leagues
              //$scope.player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

              // based on $scope.player result data return an object with the valid leagues for this $scope.player
              //$scope.player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

              // set latest leagueName
              //$scope.player.leagueName = $textManipulator.properLeagueName(profileLeagueSlug);

              return $http({
                url: 'http://origin-api.thescore.com/' + result.data.api_uri,
                method: 'GET'
              });

            })
            .then(function (result) {

              $scope.player.playerPos = result.data.position;
              $scope.player.weight = result.data.weight;
              $scope.player.height = result.data.height_feet + '\'' + result.data.height_inches;
              $scope.player.birthdate = result.data.birthdate;
              $scope.player.birthplace = result.data.birth_city + ', ' + result.data.birth_country;

              $rootScope.allPlayers = $rootScope.allPlayers || {};
              $rootScope.allPlayers[id] = $scope.player;

              return $arrayMappers.playerGamesLog({ player: $scope.player, manager: manager }, result);

            })
            .then(function (result) {

              $rootScope.loading = false;

              console.log('> result:', result);
              console.log('> $scope.player:', $scope.player);
              var newPlayer = _.defaults({}, $scope.player, result);
              console.log('newPlayer:', newPlayer);

            });

        }

      };

      /**
       * id used to identify a player from thescore.ca api
       */
      var id = Number($stateParams.playerId);

      /**
       * init function
       */
      var init = function () {

        id = Number($stateParams.playerId);
        $scope.startFireBase(fireBaseLoaded);

      };

      init();

    });

})();
