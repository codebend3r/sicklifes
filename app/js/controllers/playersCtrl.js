/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $q, $arrayMapper, $textManipulator, $scoringLogic, $leagueTeams) {

  'use strict';

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-3 small-hpadding',
      text: 'Player',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-4 small-hpadding',
      text: 'Team',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-3 small-hpadding',
      text: 'League',
      orderCriteria: 'league'
    },
    {
      columnClass: 'col-md-1 small-hpadding',
      text: 'Goals',
      orderCriteria: 'goal'
    },
    {
      columnClass: 'col-md-1 small-hpadding',
      text: 'Points',
      orderCriteria: 'points()'
    }
  ];

  $scope.order = function (predicate, reverse) {
    //reverse = !reverse;
    //console.log('predicate', predicate);
    //console.log('predicate', $scope[predicate]);
    //console.log('reverse', reverse);
    //$scope.selectedTeam = orderBy($scope.selectedTeam, predicate, reverse);
  };

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

  $scope.changeTeam = function () {

    console.log('change team', $scope.defaultTeam);
    //$scope.populateTable();

  };

  /**
   * init function
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
   * all requests complete
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
   * builds table
   */
  $scope.populateTable = function () {

    console.log('$scope.populateTable');

    $scope.totalPoints = 0;

    $scope.selectedTeam.players.forEach(function (teamPlayer) {

      teamPlayer.goals = 0; // start at 0;

      $scope.allPlayers.forEach(function (leaguePlayer) {

        //console.log(teamPlayer.playerName.toLowerCase(), '===', stripVowelAccent(leaguePlayer.playerName.toLowerCase()));

        if (teamPlayer.playerName.toLowerCase() === $textManipulator.stripVowelAccent(leaguePlayer.playerName.toLowerCase())) {

          teamPlayer.goals += leaguePlayer.goals;
          teamPlayer.points = $scoringLogic.calculatePoints(teamPlayer.goals, leaguePlayer.league());

          $scope.totalPoints += teamPlayer.points;

          console.log('====================================================');
          console.log('MATCH leaguePlayer |', leaguePlayer.league(), '|', leaguePlayer.playerName, '|', leaguePlayer.teamName);

          $apiFactory.getData({
            endPointURL: $scope.getPlayerURL(leaguePlayer.league(), leaguePlayer.id),
            qCallBack: function (result) {

              //var resultArray = result.data.map(function(i) {

              //console.log('player name:', i.player.full_name);
              //console.log('goals: ', i.goals);
              //console.log(i);
              //teamPlayer.goals += result.data.length;

              //});

              //console.log('=============================================');

            }
          })

        }

      });

    });

  };

  $scope.init();


});