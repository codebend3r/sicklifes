(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('teamsCtrl', function ($scope, $http, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.leagueTableHeader = [
        {
          columnClass: 'col-xs-12 small-hpadding',
          text: 'Players'
        }
      ];

      /**
       * TODO
       */
      $scope.loading = true;

      /**
       * init
       */
      var init = function () {

        if (angular.isDefined($stateParams.teamId) && angular.isDefined($stateParams.leagueName)) {

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId,
            method: 'GET'
          }).then(function(result) {

            console.log('TEAM:', result.data);

            $scope.teamName = result.data.full_name;
            $scope.largeLogo = result.data.logos.large;

          });

          $http({
            url: 'http://api.thescore.com/' + $stateParams.leagueName + '/teams/' + $stateParams.teamId + '/players',
            method: 'GET'
          }).then(function(result) {

            $scope.loading = false;
            console.log('PLAYERS:', result.data);

            $scope.players = _.map(result.data, function(teamData) {
              return {
                id: teamData.id,
                position: teamData.position,
                fullName: teamData.full_name,
                headshot: teamData.headshots.w192xh192
              };
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
