/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $location, $arrayMapper, localStorageService) {

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2 small-hpadding',
      text: 'Rank'
    },
    {
      columnClass: 'col-md-4 col-sm-4 col-xs-8 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-2 col-sm-4 hidden-xs small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-3 col-sm-4 hidden-xs small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-2 text-center small-hpadding',
      text: 'G'
    }
  ];

  $scope.allRequest = [];

  $scope.changeLeague = function (league) {

    console.log('change leagues', league);

  };

  $scope.allRequestComplete = function () {

    //var fb = new Firebase('https://glaring-fire-9383.firebaseio.com/');
    //fb.set('$leagueTeams', $leagueTeams);
    //fb.set({blah:'blah', text:'inter'});

    $scope.loading = false;

    $scope.allLeagues = [
      {
        name: 'La Liga',
        source: localStorageService.get('liga') ? localStorageService.get('liga') : $scope.allLeagueDataObj.liga
      },
      {
        name: 'EPL',
        source: localStorageService.get('epl') ? localStorageService.get('epl') : $scope.allLeagueDataObj.epl
      },
      {
        name: 'Serie A',
        source: localStorageService.get('seri') ? localStorageService.get('seri') : $scope.allLeagueDataObj.seri
      },
      {
        name: 'Champions League',
        source: localStorageService.get('chlg') ? localStorageService.get('chlg') : $scope.allLeagueDataObj.chlg
      },
      {
        name: 'Europa League',
        source: localStorageService.get('uefa') ? localStorageService.get('uefa') : $scope.allLeagueDataObj.uefa
      }
    ];

    $scope.selectedLeague = $scope.allLeagues[0];
    //$scope.allRequestComplete = null;

  };

  $scope.updateData = function() {

    $scope.allRequest = [];

    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  $scope.init = function () {

    //localStorageService.clearAll();

    if (localStorageService.get('allLeagues')) {

      $scope.allLeaguesData = localStorageService.get('allLeagues');
      $scope.allRequestComplete();

    } else {

      $scope.updateData();

    }

  };

  $scope.init();

});
