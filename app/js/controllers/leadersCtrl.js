/**
 * Created by Bouse on 08/29/2015
 */

angular.module('sicklifes')

  .controller('leadersCtrl', function ($scope, $http, $stateParams) {

    $scope.tableHeader = [
      {
        text: 'Ranking'
      },
      {
        text: 'Team'
      },
      {
        text: 'Player'
      },
      {
        text: 'Goals'
      }
    ];

    $http({
      url: 'http://api.thescore.com/' + $stateParams.leagueName + '/leaders?categories=Goals&season_type=regular',
      method: 'GET'
    }).then(function (result) {

      $scope.leagueLeaders = _.map(result.data.Goals, function(data) {

        return {
          id: data.id,
          rank: data.ranking,
          goals: data.stat,
          logo: data.team.logos.small,
          playerName: data.player.full_name,
          teamName: data.team.full_name,
        };

      });

    });

  });
