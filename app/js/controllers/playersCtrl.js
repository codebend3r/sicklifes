/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $q, $leagueTeams) {

  console.log('playersCtrl');

  'use strict';

  $scope.tableHeader = [
    {
      columnClass: 'col-md-5 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-5 small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 small-hpadding',
      text: 'Goals'
    }
  ];

  $scope.allRequest = []; // array of promises

  $scope.chesterTeams = $leagueTeams.chester.players;

  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete');

    $leagueTeams.chester.players.forEach(function (teamPlayer) {

      $scope.topLigaScorers.forEach(function (leaguePlayer) {

        //console.log(leaguePlayer.playerName, '===', teamPlayer.player);
        if (leaguePlayer.playerName === teamPlayer.playerName) {

          console.log('MATCH', leaguePlayer.playerName);
          console.log('MATCH', leaguePlayer);
          console.log('MATCH', teamPlayer);

        }

      });

    });

  };


});