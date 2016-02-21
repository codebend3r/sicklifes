/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('rostersCtrl', function ($scope, $http, $stateParams, $rootScope, $localStorage, apiFactory, arrayMappers, momentService, managersService, textManipulator, objectUtils, allPlayersIndex) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

      /**
       * @description
       * @type {Array}
       */
      $scope.players = [];

      /**
       * @description order by position
       */
      $scope.playerPosition = function (player) {
        return ['F', 'M', 'D', 'G'].indexOf(player.pos);
      };

      /**
       * @description
       * @param data
       */
      var loadData = function (data) {

        if (angular.isDefined(data[$stateParams.teamId])) {

          $scope.players = data[$stateParams.teamId].roster;
          $scope.teamName = data[$stateParams.teamId].teamName;
          $scope.largeLogo = data[$stateParams.teamId].logo;
          $scope.record = data[$stateParams.teamId].record;
          $scope.formattedRank = data[$stateParams.teamId].formattedRank;

        } else {

          $scope.players = [];

        }

        httpRequest();

      };

      /**
       * @description httpRequest
       */
      var httpRequest = function () {

        console.log('rostersCtrl.httpRequest()');

        var playersIndex = allPlayersIndex.data;

        console.log('$stateParams.teamId:', $stateParams.teamId);
        console.log('$stateParams.leagueName:', $stateParams.leagueName);
        //console.log('playersIndex:', playersIndex);

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          console.log('team id && league name defined');

          $http.get('http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId)
            .then(function (result) {

              // first get team logo, name and record
              $scope.teamName = result.data.full_name;
              $scope.largeLogo = result.data.logos.large;
              $scope.record = result.data.standing.short_record;
              $scope.formattedRank = result.data.standing.formatted_rank;

              return $http.get('http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId + '/players');

            })
            .then(function (result) {

              // then get team roster and map it accordingly

              $scope.players = [];

              var numberOfPlayers = _.size(result.data),
                numberOfRequests = 0;

              _.each(result.data, function (player) {

                if (!angular.isUndefinedOrNull(allPlayersIndex.data[player.id]) && !angular.isUndefinedOrNull(allPlayersIndex.data[player.id]._lastSyncedOn) && !momentService.isPastYesterday(allPlayersIndex.data[player.id]._lastSyncedOn)) {

                  console.log('synced data found for', player.full_name);

                  $scope.players.push(allPlayersIndex.data[player.id]);

                  numberOfRequests += 1;

                  if (numberOfRequests === numberOfPlayers) {
                    $rootScope.loading = false;
                    //$scope.saveTeamToPlayerIndex($scope.players);
                  }

                } else {

                  console.log('new request for', player.full_name);

                  var matchingManager = managersService.findPlayerInManagers(player.id).manager;

                  player = objectUtils.playerResetGoalPoints(player);

                  apiFactory.getPlayerProfile('soccer', player.id)
                    .then(function (playerResult) {
                      player.playerName = playerResult.data.full_name;
                      return arrayMappers.playerInfo(player, playerResult);
                    })
                    //.then(arrayMappers.playerInfo.bind(this, player))
                    .then(arrayMappers.playerMapPersonalInfo.bind(this, player))
                    .then(arrayMappers.playerGamesLog.bind(this, {
                      player: player,
                      manager: matchingManager
                    }))
                    .then(function (result) {

                      player = result;
                      player._lastSyncedOn = momentService.syncDate();

                      $scope.players.push(player);

                      numberOfRequests += 1;

                      if (numberOfRequests === numberOfPlayers) {
                        console.log('DONE');
                        //$rootScope.loading = false;
                        //$scope.saveTeamToPlayerIndex($scope.players);
                      }

                    });

                }

              });

            });

        } else {

          console.warn('no teamId or leagueId specified');

        }

      };

      apiFactory.getApiData('allPlayersIndex')
        .then(loadData);

    });

})();
