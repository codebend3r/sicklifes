/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('rostersCtrl', function ($scope, $http, $stateParams, $rootScope, $localStorage, $apiFactory, $arrayMappers, $momentService, $textManipulator, $objectUtils) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      $scope.loading = true;

      /**
       * TODO
       * @type {Array}
       */
      $scope.players = [];

      /**
       * order by position
       */
      $scope.playerPosition = function (player) {
        return ['F', 'M', 'D', 'G'].indexOf(player.pos);
      };

      /**
       *
       * @param firebaseData
       */
      var fireBaseLoaded = function (firebaseData) {

        if (!angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName])) {

          console.log('defined in firebase');
          loadData(firebaseData[$scope.dataKeyName]);

        } else {

          console.log('not defined in firebase');
          httpRequest();

        }

      };

      /**
       *
       * @param data
       */
      var loadData = function (data) {

        console.log('///////////////////');
        console.log('data:', data);
        console.log('///////////////////');

        $scope.players = data[$stateParams.teamId].roster;

        $scope.teamName = data[$stateParams.teamId].teamName;
        $scope.largeLogo = data[$stateParams.teamId].logo;
        $scope.record = data[$stateParams.teamId].record;
        $scope.formattedRank = data[$stateParams.teamId].formattedRank;

        $scope.loading = false;

      };

      /**
       * httpRequest
       */
      var httpRequest = function () {

        var playersIndex = $rootScope.firebaseData.allPlayersIndex;

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          })
            .then(function (result) {

              //console.log('> initial data:', result.data);
              $scope.teamName = result.data.full_name;
              $scope.largeLogo = result.data.logos.large;
              $scope.record = result.data.standing.short_record;
              $scope.formattedRank = result.data.standing.formatted_rank;

              return $http({
                url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId + '/players',
                method: 'GET'
              });

            })
            .then(function (result) {

              //console.log('> start mapping:', result.data);
              $scope.loading = false;
              var numberOfRequests = 0;

              _.each(result.data, function (player) {

                var indexPlayer = playersIndex.data[player.id];

                if (angular.isDefined(indexPlayer) && !Array.isArray(playersIndex)) {

                  //console.log('index player found:', indexPlayer.playerName, indexPlayer.goals, indexPlayer.assists);

                  $scope.players.push(indexPlayer);

                } else {

                  numberOfRequests += 1;

                  /*
                  $apiFactory.getPlayerProfile('soccer', player.id)
                    .then(function (result) {
                      //player.playerName = $textManipulator.stripVowelAccent(result.data.full_name);
                      player.playerName = $textManipulator.formattedFullName(player.first_name, player.last_name);
                      return $arrayMappers.playerInfo(player, result);
                    })
                    .then($arrayMappers.playerMapPersonalInfo.bind(this, player))
                    .then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: null }))
                    .then(function (result) {

                      //console.log('new player:', result.playerName, result.goals, result.assists);

                      result = $objectUtils.playerResetGoalPoints(result);

                      $scope.players.push(result);

                      $rootScope.loading = false;
                      //saveToIndex();

                    });
                    */

                }

              });

              //var loadedTeam = {};
              //loadedTeam[$stateParams.teamId] = {
              //  _lastSyncedOn: $momentService.syncDate(),
              //  logo: $scope.largeLogo,
              //  teamName: $scope.teamName,
              //  formattedRank: $scope.formattedRank,
              //  record: $scope.record,
              //  leagueName: $stateParams.leagueName,
              //  roster: $scope.players
              //};

              //$scope.startFireBase(function (fbData) {
              //console.log('loadedTeam', loadedTeam);
              //console.log('fbData', fbData[$scope.dataKeyName]);
              //$rootScope.fireBaseReady = true;
              //_.defaults(loadedTeam, fbData[$scope.dataKeyName]);
              //console.log('loaded team:', loadedTeam);
              //$scope.saveToFireBase(loadedTeam, $scope.dataKeyName);
              //});

            });

        }

      };

      /**
       * init
       */
      var init = function () {

        $scope.dataKeyName = 'allTeamsPool';

        $scope.startFireBase(function () {

          httpRequest();

        });

        //if (angular.isDefined($rootScope[$scope.dataKeyName])) {
        //
        //  console.log('load from $rootScope');
        //  loadData($rootScope[$scope.dataKeyName]);
        //
        //} else if (angular.isDefined($localStorage[$scope.dataKeyName])) {
        //
        //  console.log('load from local storage');
        //  loadData($localStorage[$scope.dataKeyName]);
        //
        //} else {
        //
        //  console.log('load from firebase');
        //  $scope.startFireBase(fireBaseLoaded);
        //
        //}

      };

      init();

    });

})();
