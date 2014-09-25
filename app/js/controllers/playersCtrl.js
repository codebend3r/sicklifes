/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $routeParams, $arrayMapper, localStorageService, $leagueTeams, $location) {

  'use strict';

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-sm-5 col-xs-8',
      text: 'Player',
      orderCriteria: 'player'
    },
    {
      columnClass: 'col-md-2 col-sm-3 hidden-xs',
      text: 'Team',
      orderCriteria: 'team'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'League',
      orderCriteria: 'league'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-1 text-center',
      text: 'DG',
      orderCriteria: 'domestic'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-1 text-center',
      text: 'CLG',
      orderCriteria: 'champions'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-1 text-center',
      text: 'ELG',
      orderCriteria: 'euro'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-1 text-center',
      text: 'P',
      orderCriteria: 'total points for player'
    }
  ];

  /*
   <div class='col-md-4 col-sm-5 col-xs-8'>{{scorer.playerName}}</div>
   <div class='col-md-2 col-sm-3 hidden-xs small-text bold'>{{scorer.teamName}}</div>
   <div class='col-md-2 hidden-sm hidden-xs small-text'>{{scorer.league}}</div>
   <div class='col-md-1 col-sm-1 col-xs-1 text-center'>{{scorer.domesticGoals}}</div>
   <div class='col-md-1 col-sm-1 col-xs-1 text-center'>{{scorer.clGoals}}</div>
   <div class='col-md-1 col-sm-1 col-xs-1 text-center'>{{scorer.eGoals}}</div>
   <div class='col-md-1 col-sm-1 col-xs-1 text-center'>{{scorer.points}}</div>
   */

  $scope.changeTeam = function (selectedTeam) {

    console.log('change team', selectedTeam);
    $scope.selectedTeam = selectedTeam;
    $scope.populateTable();

  };

  /**
   * init function
   */
  $scope.init = function () {

    localStorageService.clearAll();

    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

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

    $scope.allPlayers = $scope.allLeagueDataObj.allLeagues;

    if ($routeParams.team) {
      $scope.allTeams.forEach(function (team) {
        if (team.personName === $routeParams.team) {
          $scope.selectedTeam = team;
        }
      });
    } else {
      $scope.selectedTeam = $scope.allTeams[0];
    }

    $scope.populateTable();

  };

  /**
   * builds table
   */
  $scope.populateTable = function () {

    console.log('$scope.populateTable');
    $scope.selectedTeam.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, $scope.selectedTeam));

    /*$scope.selectedTeam.players.forEach(function (player) {

     console.log(player);

     });*/


  };

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

  $scope.init();

});