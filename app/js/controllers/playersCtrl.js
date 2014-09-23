/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $routeParams, $arrayMapper, localStorageService, $leagueTeams, $location) {

  'use strict';

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-5 col-sm-4 small-hpadding',
      text: 'Player',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-5 col-sm-4 small-hpadding',
      text: 'Team',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-3 hidden-sm small-hpadding',
      text: 'League',
      orderCriteria: 'league'
    },
    {
      columnClass: 'col-md-1 col-sm-1 small-hpadding',
      text: 'G',
      orderCriteria: 'goal'
    },
    {
      columnClass: 'col-md-1 col-sm-1 small-hpadding',
      text: 'P',
      orderCriteria: 'points()'
    }
  ];

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