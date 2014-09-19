/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $arrayMapper, $filter, $textManipulator, $scoringLogic, $leagueTeams) {

  'use strict';

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-6 small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-6 text-center small-hpadding',
      text: 'Total Points'
    }
  ];

  /**
   *
   * @param league
   * @param id
   * @returns {string}
   */
  $scope.getPlayerURL = function (league, id) {
    var url = 'http://api.thescore.com/' + league + '/players/' + id + '/player_records?rpp=100';
    return url;
  };

  /**
   *
   */
  $scope.init = function () {

    $scope.allPlayers = [];

    $apiFactory.getAllLeagues().forEach(function (defer, index) {

      defer.promise.then(function (result) {
        $scope.allPlayers = $scope.allPlayers.concat(result.data.goals.map($arrayMapper.goalsMap));
      });

    });

    $q.all($apiFactory.getAllLeagues().map(function (defer) {

      return defer.promise;

    })).then($scope.allRequestComplete);

  };

  $scope.allRequest = []; // array of promises

  /**
   *
   */
  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete');
    $scope.loading = false;

    $scope.allTeams = [
      $leagueTeams.chester,
      $leagueTeams.frank,
      $leagueTeams.dan,
      $leagueTeams.justin,
      $leagueTeams.mike,
      $leagueTeams.joe
    ];

    $scope.selectedTeam = $scope.allTeams[0];
    $scope.populateTable();

  };

  /**
   *
   */
  $scope.populateTable = function () {

    $scope.allTeams.forEach(function (team) {

      team.totalPoints = 0;

      team.players.forEach(function (teamPlayer) {

        $scope.allPlayers.forEach(function (leaguePlayer) {

          if (teamPlayer.playerName.toLowerCase() === $textManipulator.stripVowelAccent(leaguePlayer.playerName.toLowerCase())) {

            teamPlayer.goals += leaguePlayer.goals;
            team.totalPoints = $scoringLogic.calculatePoints(teamPlayer.goals, leaguePlayer.league());

          }

        });

      });

    });

  };

  $scope.init();


});