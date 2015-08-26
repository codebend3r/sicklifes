(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('teamsCtrl', function ($scope, $http, $stateParams) {

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
       * TODO
       */
      $scope.playerPosition = function (player) {
        return ['G', 'D', 'M', 'F'].indexOf(player.position);
      };

      /**
       * init
       */
      var init = function () {

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          }).then(function (result) {

            //console.log('TEAM:', result.data);

            $scope.teamName = result.data.full_name;
            $scope.largeLogo = result.data.logos.large;

          });

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId + '/players',
            method: 'GET'
          }).then(function (result) {

            $scope.loading = false;
            //console.log('PLAYERS:', result.data);

            $scope.players = _.map(result.data, function (player) {
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

          });

        } else {

          console.log('NO TEAM ID');
          $scope.loading = false;
          $scope.players = {
            data: 'no team id'
          };

        }

      };

      init();

    });

})();
