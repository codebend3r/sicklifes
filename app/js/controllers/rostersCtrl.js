/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('rostersCtrl', function ($scope, $http, $stateParams, $rootScope, $localStorage, $apiFactory, $arrayMappers, $momentService, $textManipulator, $objectUtils, $updateDataUtils) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

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
      // var fireBaseLoaded = function (firebaseData) {
      //
      //   if (!angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName])) {
      //
      //     console.log('defined in firebase');
      //     loadData(firebaseData[$scope.dataKeyName]);
      //
      //   } else {
      //
      //     console.log('not defined in firebase');
      //     httpRequest();
      //
      //   }
      //
      // };

      /**
       *
       * @param data
       */
      var loadData = function (data) {

        //$scope.players = data[$stateParams.teamId].roster;

        $scope.teamName = data[$stateParams.teamId].teamName;
        $scope.largeLogo = data[$stateParams.teamId].logo;
        $scope.record = data[$stateParams.teamId].record;
        $scope.formattedRank = data[$stateParams.teamId].formattedRank;

        httpRequest();

      };

      /**
       * httpRequest
       */
      var httpRequest = function () {

        console.log('rostersCtrl --> httpRequest');

        var playersIndex = $rootScope.allPlayersIndex;

        console.log('$stateParams.teamId:', $stateParams.teamId);
        console.log('$stateParams.leagueName:', $stateParams.leagueName);

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          console.log('team id && league name defined');

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          })
            .then(function (result) {

              console.log('> initial data:', result.data);
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

              $rootScope.loading = false;

              var numberOfPlayers = _.keys(result.data).length
              var numberOfRequests = 0;

              console.log('numberOfPlayers', numberOfPlayers);

              _.each(result.data, function (player) {

                // if (angular.isDefined(indexPlayer) && !Array.isArray(playersIndex)) {
                // var indexPlayer = playersIndex.data[player.id];
                //
                //   console.log('index player found:', indexPlayer.playerName, indexPlayer.goals, indexPlayer.assists);
                //   $scope.players.push(indexPlayer);
                //
                // } else {

                    /////////////////////

                    var currentPlayer = $objectUtils.playerResetGoalPoints({});

                    $apiFactory.getPlayerProfile('soccer', player.id)
                      .then(function (result) {
                        currentPlayer.playerName = result.data.full_name;
                        currentPlayer.id = player.id;
                        return $arrayMappers.playerInfo(currentPlayer, result);
                      })
                      .then($arrayMappers.playerMapPersonalInfo.bind(this, currentPlayer))
                      .then($arrayMappers.playerGamesLog.bind(this, {
                        player: currentPlayer,
                        manager: null
                      }))
                      .then(function (result) {

                        currentPlayer = result;
                        currentPlayer._lastSyncedOn = $momentService.syncDate();

                        console.log('>', currentPlayer);

                        $scope.players.push(currentPlayer);

                        numberOfRequests += 1;

                        // if (numberOfRequests === numberOfPlayers) {
                        //   $scope.saveTeamToIndex($scope.players);
                        // }

                      });

                //}

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

        } else {

          console.warn('ERROR not defined');

        }

      };

      /**
       * init
       */
      var init = function () {

        $updateDataUtils.updateCoreData(function () {

          $apiFactory.getApiData('allTeamsPool')
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
        //  $apiFactory.getApiData('allTeamsPool')
        //    .then(loadData);
        //
        //}

      };

      init();

    });

})();
