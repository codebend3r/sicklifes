/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $q, $arrayMapper, $leagueTeams) {

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
      columnClass: 'col-md-1 small-hpadding',
      text: 'Goals'
    },
    {
      columnClass: 'col-md-1 small-hpadding',
      text: 'Points'
    }
  ];

  /**
   *
   * @param league
   * @param id
   * @returns {string}
   */
  $scope.getPlayerURL = function(league, id) {
    var url = 'http://api.thescore.com/' + league + '/players/' + id + '/player_records?rpp=100';
    return url;
  };

  $scope.changeTeam = function() {

    console.log($scope.selectedTeam);
    //$scope.selectedTeam = $scope.allTeams[i];
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

    $q.all($apiFactory.getAllLeagues().map(function(defer) {

      return defer.promise;

    })).then($scope.allRequestComplete);

  };

  $scope.allRequest = []; // array of promises

  /**
   *
   */
  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete');

    $scope.allTeams = [
      $leagueTeams.chester,
      $leagueTeams.frank
    ];

    $scope.selectedTeam = $scope.allTeams[0];
    $scope.populateTable();

  };

  /**
   *
   */
  $scope.populateTable = function() {

    $scope.totalPoints = 0;

    $scope.selectedTeam.players.forEach(function (teamPlayer) {

      teamPlayer.goals = 0; // start at 0;

      $scope.allPlayers.forEach(function (leaguePlayer) {

        //console.log(teamPlayer.playerName.toLowerCase(), '===', leaguePlayer.playerName.toLowerCase());
        if (teamPlayer.playerName.toLowerCase() === leaguePlayer.playerName.toLowerCase()) {

          teamPlayer.goals += leaguePlayer.goals;
          teamPlayer.points = function() {
            return teamPlayer.goals * 2;
          };

          $scope.totalPoints += leaguePlayer.goals * 2;

          console.log('====================================================');
          console.log('MATCH leaguePlayer |', leaguePlayer, leaguePlayer.league(), '|' , leaguePlayer.playerName, '|' , leaguePlayer.teamName);

          $apiFactory.getData({
            endPointURL: $scope.getPlayerURL(leaguePlayer.league(), leaguePlayer.id),
            qCallBack: function (result) {

              //var resultArray = result.data.map(function(i) {

              //console.log('player name:', i.player.full_name);
              //console.log('goals: ', i.goals);
              //console.log(i);
              //debugger;
              //teamPlayer.goals += result.data.length;

              //});

              console.log('=============================================');

            }
          })

        }

      });

    });

  };

  $scope.init();


});