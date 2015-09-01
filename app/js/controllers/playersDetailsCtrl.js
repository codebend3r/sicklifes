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

      /*
       * TODO
       */
      $scope.loading = true;

      /*
       * TODO
       */
      $scope.admin = $stateParams.admin;

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

      var checkYesterday = function (syncDate) {

        if ($momentService.isPastYesterday(syncDate)) {
          console.log('IS YESTERDAY');
          //getHttpData();
          return true;
        } else {
          console.log('NOT YESTERDAY YET');
          $scope.loading = false;
          return false;
        }

      };

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

        console.log('playersDetailsCtrl --> fireBaseLoaded');

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

        console.log('syncDate:', playerPoolData._lastSyncedOn);

        // checkYesterday(syncDate);

        findPlayerByID();

      };

      var onRequestFinished = function (data) {

        console.log('DATA:', data);
        //console.log('CURRENT PLAYER:', $scope.player);
        //console.log(data);

      };

      /**
       * find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        var foundPlayer = false;

        $scope.allPlayers.some(function (player) {
          if (player.id === id) {
            $scope.player = player;
            foundPlayer = true;
            return true;
          }
        });

        var manager = managersData[$scope.player.managerName] || null;

        $apiFactory.getPlayerProfile('soccer', id)
          .then(function (result) {

            var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

            $scope.player.id = result.data.id;

            if (result.data.teams[0]) {
              // url for team logo
              $scope.player.teamLogo = result.data.teams[0].sportsnet_logos.large;
              // set latest teamName to whatever the first value is in the stack
              $scope.player.teamName = $textManipulator.teamNameFormatted(result.data.teams[0].full_name);
            }

            // url for $scope.player image
            $scope.player.playerImage = result.data.headshots.original;

            // returns a concat string with all valid leagues
            $scope.player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

            // based on $scope.player result data return an object with the valid leagues for this $scope.player
            $scope.player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

            // set latest leagueName
            $scope.player.leagueName = $textManipulator.properLeagueName(profileLeagueSlug);

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

            $scope.loading = false;

            $rootScope.allPlayers = $rootScope.allPlayers || {};
            $rootScope.allPlayers[id] = $scope.player;

            return $arrayMappers.playerGamesLog({ player: $scope.player, manager: manager }, result);

          })
          .then(function (result) {

            console.log('> result:', result);

          });

      };

      /**
       * id used to identify a player from thescore.ca api
       */
      var id = Number($stateParams.playerID);

      /**
       * init function
       */
      var init = function () {

        id = Number($stateParams.playerID);
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(fireBaseLoaded);

      };

      init();

    });

})();
