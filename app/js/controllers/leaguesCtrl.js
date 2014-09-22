/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $location, $arrayMapper, localStorageService) {

  $scope.loading = true;

  'use strict';

  $scope.tableHeader = [
    {
      columnClass: 'col-md-2 col-xs-2 small-hpadding',
      text: 'Rank'
    },
    {
      columnClass: 'col-md-4 col-xs-4 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-4 col-xs-4 small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 col-xs-2 small-hpadding',
      text: 'Goals'
    }
  ];

  $scope.allRequest = []; // array of promises

  $scope.topLigaScorers = [];
  $scope.topEPLScorers = [];
  $scope.topSeriScorers = [];
  $scope.topCLScorers = [];
  $scope.topEuropaScorers = [];

  $scope.changeLeague = function (league) {

    console.log('change leagues', league);

  };

  $scope.allRequestComplete = function () {

    console.log('$scope.allRequestComplete', $scope.allLeaguesData.allLeagues);
    $scope.loading = false;

    $scope.allLeagues = [
      {
        name: 'La Liga',
        source: $scope.allLeagueDataObj.liga
      },
      {
        name: 'EPL',
        source: $scope.allLeagueDataObj.epl
      },
      {
        name: 'Serie A',
        source: $scope.allLeagueDataObj.seri
      },
      {
        name: 'Champions League',
        source: $scope.allLeagueDataObj.chlg
      },
      {
        name: 'Europa League',
        source: $scope.allLeagueDataObj.uefa
      }
    ];

    $scope.selectedLeague = $scope.allLeagues[0];
    $scope.allRequestComplete = null;
    console.log('localStorageService.keys', localStorageService.keys());

  };

  $scope.init = function(){

    localStorageService.clearAll();

    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  $scope.init();

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };


});