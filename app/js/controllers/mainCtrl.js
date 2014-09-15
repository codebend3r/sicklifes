/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('mainCtrl', function ($scope, $http, $q, $leagueTeams) {

  'use strict';

  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 small-hpadding',
      text: 'ID'
    },
    {
      columnClass: 'col-md-1 small-hpadding',
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

  $scope.topLigaScorers = [];
  $scope.topEPLScorers = [];
  $scope.topSeriScorers = [];

  var allRequest = [ ];

  $q.all(allRequest).then(function(){

    console.log('all loaded');

  });

  var ligaURL = 'http://api.thescore.com/liga/leaders?categories=goals',
    eplURL = 'http://api.thescore.com/epl/leaders?categories=goals',
    seriURL = 'http://api.thescore.com/seri/leaders?categories=goals',

    getData = function (endPoint) {

      var defer = $q.defer(),
        httpObject = {
          method: endPoint.method || 'GET',
          url: endPoint.endPointURL
        };

      //console.log('endPoint.endPointURL:', endPoint.endPointURL);

      $http(httpObject).then(function (result) {

        defer.resolve(result);
        //console.log('resolved', endPoint.endPointURL);
        if (angular.isDefined(endPoint.qCallBack)) endPoint.qCallBack(result);

      });

      return defer;

    },

    getLigaLeaders = function () {

      var url = ligaURL,
        ligaRequest = getData({
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
            endPoint: getData({
              endPointURL: 'http://api.thescore.com/liga/players/' + i.player.id + '/player_records?rpp=100',
              qCallBack: function (result) {
                league.games = result
              }
            })
          };

          return league;

        });

        console.log('$scope.topLigaScorers:', $scope.topLigaScorers);

        allRequest.push(ligaRequest.promise);

        $leagueTeams.chester.players.forEach(function (teamPlayer) {

          //console.log('teamPlayer', teamPlayer);

          $scope.topLigaScorers.forEach(function(leaguePlayer) {

            //console.log(leaguePlayer.playerName, '===', teamPlayer.player);
            if (leaguePlayer.playerName === teamPlayer.player) {

              console.log('MATCH');

            }

          });

        });


      });

      return ligaRequest;

    },

    getEPLLeaders = function () {

      var url = eplURL,
        eplRequest = getData({
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
            endPoint: getData({
              endPointURL: 'http://api.thescore.com/epl/players/' + i.player.id + '/player_records?rpp=100',
              qCallBack: function (result) {
                league.games = result
              }
            })
          };

          return league;

        });

        console.log('$scope.topEPLScorers:', $scope.topEPLScorers);
        allRequest.push(eplRequest.promise);

      });

      return eplRequest;

    },

    getSeriLeaders = function () {

      var url = seriURL,
        seriRequest = getData({
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
            endPoint: getData({
              endPointURL: 'http://api.thescore.com/seri/players/' + i.player.id + '/player_records?rpp=100',
              qCallBack: function (result) {
                league.games = result
              }
            })
          };

          return league;

        });

        console.log('$scope.topSeriScorers:', $scope.topSeriScorers);
        allRequest.push(seriRequest.promise);

      });

      return seriRequest;

    };

  getLigaLeaders();
  getEPLLeaders();
  getSeriLeaders();


});