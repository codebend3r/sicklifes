/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('rostersCtrl', function ($scope, $http, $stateParams, $rootScope, $localStorage, apiFactory, arrayMappers, momentService, managersService, textManipulator, objectUtils, updateDataUtils) {

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

        console.log('rostersCtrl --> httpRequest');

        var playersIndex = $rootScope.allPlayersIndex;

        console.log('$stateParams.teamId:', $stateParams.teamId);
        console.log('$stateParams.leagueName:', $stateParams.leagueName);
        //console.log('playersIndex:', playersIndex);

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          console.log('team id && league name defined');

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          })
            .then(function (result) {

              // first get team logo, name and record

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

              // then get team roster and map it accordingly

              $scope.players = [];

              var numberOfPlayers = _.size(result.data),
                numberOfRequests = 0;

              console.log('player pool index size:', _.size(playersIndex));

              _.each(result.data, function (player) {

                console.log('---------------------');
                console.log('player._lastSyncedOn', player._lastSyncedOn);
                console.log('angular.isUndefinedOrNull(player._lastSyncedOn)', angular.isUndefinedOrNull(player._lastSyncedOn));
                console.log('momentService.isPastYesterday(player._lastSyncedOn)', momentService.isPastYesterday(player._lastSyncedOn));

                if (angular.isDefined(playersIndex) && angular.isDefined(playersIndex[player.id]) && !Array.isArray(playersIndex) && (!angular.isUndefinedOrNull(player._lastSyncedOn) && !momentService.isPastYesterday(player._lastSyncedOn))) {

                  console.log('synced data found for', player.full_name);

                  var indexPlayer = playersIndex[player.id];

                  $scope.players.push(indexPlayer);

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
                        $rootScope.loading = false;
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

      /**
       * @description init
       */
      var init = function () {

        updateDataUtils.updateCoreData(function () {

          apiFactory.getApiData('allPlayersIndex')
            .then(loadData);

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
        //  apiFactory.getApiData('allTeamsPool')
        //    .then(loadData);
        //
        //}

      };

      init();

    });

})();
