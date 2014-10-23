/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $location, $arrayMapper, $fireBaseService) {

  //////////////////////////// public

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

  $scope.updateData = function () {

    $scope.allRequest = [];

    $scope.allLeagueDataObj = {
      cb: allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  $scope.init = function () {

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(function (data) {

      $scope.loading = false;

      $scope.allLeagues = [
        {
          name: 'La Liga',
          source: data.leagueData.LIGA
        },
        {
          name: 'EPL',
          source: data.leagueData.EPL
        },
        {
          name: 'Serie A',
          source: data.leagueData.SERI
        },
        {
          name: 'Champions League',
          source: data.leagueData.CHLG
        },
        {
          name: 'Europa League',
          source: data.leagueData.UEFA
        }
      ];

      $scope.selectedLeague = $scope.allLeagues[0];


    });

  };

  //////////////////////////// private

  var defineAllData = function () {

    return [
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

  };

  var allRequestComplete = function () {

    $scope.loading = false;

    $scope.allLeagues = defineAllData();

    $scope.selectedLeague = $scope.allLeagues[0];

    $fireBaseService.syncLeagueData();

  };

  $scope.init();

});
