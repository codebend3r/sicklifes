/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams) {

  console.log('leaguesCtrl');

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

  $scope.changeLeague = function () {

    console.log('change leagues');

  };

  var ligaURL = 'http://api.thescore.com/liga/leaders?categories=goals',
    eplURL = 'http://api.thescore.com/epl/leaders?categories=goals',
    seriURL = 'http://api.thescore.com/seri/leaders?categories=goals';

  $scope.getLigaLeaders = function () {

    var url = ligaURL,
      ligaRequest = $apiFactory.getData({
        endPointURL: url
      });

    ligaRequest.promise.then(function (result) {

      $scope.topLigaScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null,
          endPoint: $apiFactory.getData({
            endPointURL: 'http://api.thescore.com/liga/players/' + i.player.id + '/player_records?rpp=100',
            qCallBack: function (result) {
              league.games = result
            }
          })
        };

        ligaRequest.resolve(league);
        return league;

      });

      console.log('$scope.topLigaScorers:', $scope.topLigaScorers);


    });

    return ligaRequest;

  };

  $scope.getEPLLeaders = function () {

    var url = eplURL,
      eplRequest = $apiFactory.getData({
        endPointURL: url
      });

    eplRequest.promise.then(function (result) {

      $scope.topEPLScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null,
          endPoint: $apiFactory.getData({
            endPointURL: 'http://api.thescore.com/epl/players/' + i.player.id + '/player_records?rpp=100',
            qCallBack: function (result) {
              league.games = result
            }
          })
        };

        eplRequest.resolve(league);
        return league;

      });

      console.log('$scope.topEPLScorers:', $scope.topEPLScorers);

    });

    return eplRequest;

  };

  $scope.getSeriLeaders = function () {

    var url = seriURL,
      seriRequest = $apiFactory.getData({
        endPointURL: url
      });

    seriRequest.promise.then(function (result) {

      $scope.topSeriScorers = result.data.goals.map(function (i) {

        var league = {
          id: i.player.id,
          rank: i.ranking,
          playerName: i.player.full_name,
          teamName: i.team.full_name,
          goals: i.stat,
          game: null,
          endPoint: $apiFactory.getData({
            endPointURL: 'http://api.thescore.com/seri/players/' + i.player.id + '/player_records?rpp=100',
            qCallBack: function (result) {
              league.games = result
            }
          })
        };

        seriRequest.resolve(league);
        return league;

      });

      console.log('$scope.topSeriScorers:', $scope.topSeriScorers);

    });

    return seriRequest;

  };

  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete');

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
      }
    ];

    $scope.selectedLeague = $scope.allLeagues[0];

    $scope.selectedLeagueName = $scope.selectedLeague.name;

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

  };


  $q.all([$scope.getLigaLeaders().promise, $scope.getEPLLeaders().promise, $scope.getSeriLeaders().promise]).then($scope.allRequestComplete);


});