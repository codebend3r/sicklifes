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
       * table headers
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

          console.log('loaded allPlayersIndex:', angular.copy($scope.allPlayers.data), _.keys($scope.allPlayers.data).length);

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
          var manager = managersData[$scope.player.managerName] || null;

          $apiFactory.getPlayerProfile($scope.player.leagueSlugs, $stateParams.playerId)
            .then(function (result) {

              var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

              console.log('result:', result.data);
              console.log('profileLeagueSlug:', profileLeagueSlug);

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

              return $arrayMappers.playerGamesLog({ player: $scope.player, manager: manager }, result);

            })
            .then(function (result) {

              $rootScope.loading = false;

              console.log('> result:', result);
              //console.log('> $scope.player:', $scope.player);
              //var newPlayer = _.defaults({}, $scope.player, result);
              //console.log('newPlayer:', newPlayer);
              saveToIndex();

            });

        }

      };

      var saveToIndex = function () {

        $scope.allPlayers = $scope.allPlayers || {};
        $scope.allPlayers.data[$stateParams.playerId] = $scope.player;

        $scope.allPlayers._lastSyncedOn = $momentService.syncDate();

        console.log('saving allPlayersIndex:', angular.copy($scope.allPlayers.data), _.keys($scope.allPlayers.data).length);

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
