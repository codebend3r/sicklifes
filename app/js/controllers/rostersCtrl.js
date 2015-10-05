/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('rostersCtrl', function ($scope, $http, $stateParams, $rootScope, $localStorage, $momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * TODO
       */
      $scope.leagueTableHeader = [
        {
          text: 'Pos'
        },
        {
          text: 'Player'
        },
        {
          text: 'G'
        },
        {
          text: 'A'
        }
      ];

      /**
       * TODO
       */
      $scope.loading = true;

      /**
       * order by position
       */
      $scope.playerPosition = function (player) {
        return ['G', 'D', 'M', 'F'].indexOf(player.position);
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

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          })
            .then(function (result) {

              console.log('> 1', result.data);
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

              console.log('> 2', result.data);

              $scope.loading = false;

              $scope.players = _.map(result.data, function (player) {

                var indexedPlayer = $rootScope.firebaseData.allPlayersIndex.data[player.id];
                console.log('indexedPlayer', indexedPlayer);

                var playerMap = {
                  id: player.id,
                  position: player.position_abbreviation,
                  playerName: player.full_name,
                  headshot: player.headshots.w192xh192,
                  goals: 0,
                  assists: 0,
                  getGoals: function () {
                    $http({
                      url: 'http://origin-api.thescore.com/' + $stateParams.leagueName + '/players/' + player.id + '/player_records',
                      method: 'GET'
                    }).then(function (recordResult) {
                      if (angular.isDefined(recordResult.data[0])) {
                        playerMap.goals += recordResult.data[0].goals;
                        playerMap.assists += recordResult.data[0].assists;
                        console.log(playerMap.playerName, '|', playerMap.goals);
                      }
                    });

                  }.call($scope)
                };
                return playerMap;
              });

              _.each($scope.players, function (d) {
                delete d.getGoals;
              });

              var loadedTeam = {};
              loadedTeam[$stateParams.teamId] = {
                _lastSyncedOn: $momentService.syncDate(),
                logo: $scope.largeLogo,
                teamName: $scope.teamName,
                formattedRank: $scope.formattedRank,
                record: $scope.record,
                leagueName: $stateParams.leagueName,
                roster: $scope.players
              };

              $scope.startFireBase(function (fbData) {
                //console.log('loadedTeam', loadedTeam);
                //console.log('fbData', fbData[$scope.dataKeyName]);
                $rootScope.fireBaseReady = true;
                _.defaults(loadedTeam, fbData[$scope.dataKeyName]);
                $scope.saveToFireBase(loadedTeam, $scope.dataKeyName);
              });

            });

        }

      };

      /**
       * init
       */
      var init = function () {

        $scope.dataKeyName = 'allTeamsPool';

        $scope.startFireBase(function() {

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
