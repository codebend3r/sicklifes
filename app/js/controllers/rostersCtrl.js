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

      var fireBaseLoaded = function(firebaseData) {

        if (!angular.isUndefinedOrNull(firebaseData[$scope.dataKeyName])) {

          console.log('defined in firebase');
          loadFromLocal(firebaseData[$scope.dataKeyName]);

        } else {

          console.log('not defined in firebase');
          httpRequest();

        }

      };

      var loadFromLocal = function(localData) {

        console.log('///////////////////');
        console.log('LOCAL --> localData:', localData);
        console.log('syncDate:', localData._lastSyncedOn);
        console.log('///////////////////');

        $scope.players = localData[$stateParams.teamId].roster;

        $scope.teamName = localData[$stateParams.teamId].teamName;
        $scope.largeLogo = localData[$stateParams.teamId].logo;
        $scope.record = localData[$stateParams.teamId].record;
        $scope.formattedRank = localData[$stateParams.teamId].formattedRank;

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
          }).then(function (result) {

            console.log('>', result.data);
            $scope.teamName = result.data.full_name;
            $scope.largeLogo = result.data.logos.large;
            $scope.record = result.data.standing.short_record;
            $scope.formattedRank = result.data.standing.formatted_rank;

            $http({
              url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId + '/players',
              method: 'GET'
            }).then(function (result) {

              $scope.loading = false;

              $scope.players = _.map(result.data, function (player) {
                var playerMap = {
                  id: player.id,
                  position: player.position_abbreviation,
                  playerName: player.full_name,
                  headshot: player.headshots.w192xh192,
                  goals: 0,
                  assists: 0,
                  getGoals: function() {
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

              _.each($scope.players, function(d) {
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

          });

        }

      };

      /**
       * init
       */
      var init = function () {

        $scope.dataKeyName = 'allTeamsPool';

        httpRequest();
        return;

        if (angular.isDefined($rootScope[$scope.dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[$scope.dataKeyName]);

        } else if (angular.isDefined($localStorage[$scope.dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[$scope.dataKeyName]);

        } else {

          console.log('load from firebase');
          $scope.startFireBase(fireBaseLoaded);

        }

      };

      init();

    });

})();
