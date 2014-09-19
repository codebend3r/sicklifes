/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $arrayMapper, $filter, $leagueTeams) {

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

  var stripVowelAccent = function(str) {
    var rExps = [
      {re: /[\xC0-\xC6]/g, ch: 'A'},
      {re: /[\xE0-\xE6]/g, ch: 'a'},
      {re: /[\xC8-\xCB]/g, ch: 'E'},
      {re: /[\xE8-\xEB]/g, ch: 'e'},
      {re: /[\xCC-\xCF]/g, ch: 'I'},
      {re: /[\xEC-\xEF]/g, ch: 'i'},
      {re: /[\xD2-\xD6]/g, ch: 'O'},
      {re: /[\xF2-\xF6]/g, ch: 'o'},
      {re: /[\xD9-\xDC]/g, ch: 'U'},
      {re: /[\xF9-\xFC]/g, ch: 'u'},
      {re: /[\xD1]/g, ch: 'N'},
      {re: /[\xF1]/g, ch: 'n'}
    ];

    for (var i = 0, len = rExps.length; i < len; i++)
      str = str.replace(rExps[i].re, rExps[i].ch);

    return str;

  };

  /**
   *
   */
  $scope.populateTable = function () {

    $scope.allTeams.forEach(function(team) {

      team.totalPoints = 0;

      team.players.forEach(function (teamPlayer) {

        $scope.allPlayers.forEach(function (leaguePlayer) {

          //console.log(teamPlayer.playerName.toLowerCase(), '===', stripVowelAccent(leaguePlayer.playerName.toLowerCase()));

          if (teamPlayer.playerName.toLowerCase() === stripVowelAccent(leaguePlayer.playerName.toLowerCase())) {

            teamPlayer.goals += leaguePlayer.goals;
            team.totalPoints += leaguePlayer.goals * 2;

          }

        });

      });

    });

  };

  $scope.init();


});