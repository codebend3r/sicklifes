/**
 * Created by crivas on 9/18/2014.
 */

sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $routeParams, $arrayMapper, $filter, $textManipulator, $scoringLogic, $leagueTeams, $location, localStorageService) {

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

    localStorageService.clearAll();

    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  /**
   *
   */
  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete on', $scope.allLeagueDataObj.lastCheckDate);
    $scope.loading = false;

    $scope.allTeams = [
      $leagueTeams.chester,
      $leagueTeams.frank,
      $leagueTeams.dan,
      $leagueTeams.justin,
      $leagueTeams.mike,
      $leagueTeams.joe
    ];

    console.log('localStorageService.keys', localStorageService.keys());

    $scope.allPlayers = $scope.allLeagueDataObj.allLeagues;

    $scope.populateTable();

  };

  /**
   *
   */
  $scope.populateTable = function () {

    $scope.allTeams.forEach(function (team) {

      team.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, team));

    });

    //localStorageService.set('allTeams', $scope.allTeams);

  };

  $scope.init();

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };


});