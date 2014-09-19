/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams) {

  $scope.loading = true;

  'use strict';

  $scope.tableHeader = [
    {
      columnClass: 'col-md-2 small-hpadding',
      text: 'Rank'
    },
    {
      columnClass: 'col-md-4 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-4 small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 small-hpadding',
      text: 'Goals'
    }
  ];

  $scope.allRequest = []; // array of promises

  $scope.topLigaScorers = [];
  $scope.topEPLScorers = [];
  $scope.topSeriScorers = [];
  $scope.topCLScorers = [];
  $scope.topEuropaScorers = [];

  $scope.changeLeague = function () {

    console.log('change leagues');

  };

  var ligaURL = 'http://api.thescore.com/liga/leaders?categories=goals',
    eplURL = 'http://api.thescore.com/epl/leaders?categories=goals',
    seriURL = 'http://api.thescore.com/seri/leaders?categories=goals',
    clURL = 'http://api.thescore.com/chlg/leaders?categories=goals',
    europaURL = 'http://api.thescore.com/uefa/leaders?categories=goals';

  $scope.getLigaLeaders = function () {

    var ligaRequest = $apiFactory.getData({
        endPointURL: ligaURL
      });

    ligaRequest.promise.then(function (result) {

      $scope.topLigaScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null
        };

        ligaRequest.resolve(league);
        return league;

      });


    });

    return ligaRequest;

  };

  $scope.getEPLLeaders = function () {

    var eplRequest = $apiFactory.getData({
        endPointURL: eplURL
      });

    eplRequest.promise.then(function (result) {

      $scope.topEPLScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null
        };

        eplRequest.resolve(league);
        return league;

      });

    });

    return eplRequest;

  };

  $scope.getSeriLeaders = function () {

    var seriRequest = $apiFactory.getData({
        endPointURL: seriURL
      });

    seriRequest.promise.then(function (result) {

      $scope.topSeriScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null
        };

        seriRequest.resolve(league);
        return league;

      });

    });

    return seriRequest;

  };

  $scope.getCLLeaders = function () {

    var clRequest = $apiFactory.getData({
        endPointURL: clURL
      });

    clRequest.promise.then(function (result) {

      $scope.topCLScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null
        };

        clRequest.resolve(league);
        return league;

      });

    });

    return clRequest;

  };

  $scope.getEuropaLeaders = function () {

    var europaRequest = $apiFactory.getData({
        endPointURL: europaURL
      });

    europaRequest.promise.then(function (result) {

      $scope.topEuropaScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null
        };

        europaRequest.resolve(league);
        return league;

      });

    });

    return europaRequest;

  };

  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete');
    $scope.loading = false;

    $scope.allLeagues = [
      {
        name: 'Liga',
        source: $scope.topLigaScorers
      },
      {
        name: 'EPL',
        source: $scope.topEPLScorers
      },
      {
        name: 'Serie A',
        source: $scope.topSeriScorers
      },
      {
        name: 'Champions League',
        source: $scope.topCLScorers
      },
      {
        name: 'Europa',
        source: $scope.topEuropaScorers
      }
    ];

    $scope.selectedLeague = $scope.allLeagues[0];

    $scope.selectedLeagueName = $scope.selectedLeague.name;

    console.log('$scope.allLeagues', $scope.allLeagues);
    console.log('$scope.selectedLeague', $scope.selectedLeague);

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

    $scope.allRequestComplete = null;

  };

  $q.all([$scope.getLigaLeaders().promise, $scope.getEPLLeaders().promise, $scope.getSeriLeaders().promise, $scope.getCLLeaders().promise, $scope.getEuropaLeaders().promise]).then($scope.allRequestComplete);


});