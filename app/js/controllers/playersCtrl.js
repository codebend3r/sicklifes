/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $q, $arrayMapper, $filter, $leagueTeams) {

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

  $scope.reverse = true;

  var orderBy = $filter('orderBy');

  $scope.order = function(predicate, reverse) {
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

    console.log($scope.selectedTeam);
    $scope.populateTable();

  };

  /**
   *
   */
  $scope.init = function () {

    $scope.allPlayers = [];

    $apiFactory.getAllLeagues().forEach(function (defer, index) {

      defer.promise.then(function (result) {

        $scope.allPlayers = $scope.allPlayers.concat(result.data.goals.map($arrayMapper.goalsMap));

        console.log('allPlayers --> allPlayers', index, $scope.allPlayers.length);

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

    $scope.totalPoints = 0;
    $scope.selectedPlayers = $scope.selectedTeam.players;

    $scope.selectedTeam.players.forEach(function (teamPlayer) {

      teamPlayer.goals = 0; // start at 0;

      $scope.allPlayers.forEach(function (leaguePlayer) {

        //console.log(teamPlayer.playerName.toLowerCase(), '===', stripVowelAccent(leaguePlayer.playerName.toLowerCase()));

        if (teamPlayer.playerName.toLowerCase() === stripVowelAccent(leaguePlayer.playerName.toLowerCase())) {

          teamPlayer.goals += leaguePlayer.goals;
          teamPlayer.points = function () {
            return teamPlayer.goals * 2;
          };

          $scope.totalPoints += leaguePlayer.goals * 2;

          console.log('====================================================');
          console.log('');
          console.log('MATCH leaguePlayer |', leaguePlayer.league(), '|', leaguePlayer.playerName, '|', leaguePlayer.teamName);
          console.log('');

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

    console.log('$scope.selectedPlayers:', $scope.selectedPlayers);

  };

  $scope.init();


});