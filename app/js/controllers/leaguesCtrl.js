/**
 * Created by Bouse on 11/03/2014
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $location, $arrayMappers, $fireBaseService) {

  //////////////////////////// public

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 small-hpadding',
      text: 'Rank'
    },
    {
      columnClass: 'col-md-4 col-sm-5 col-xs-8 small-hpadding',
      text: 'Player'
    },
    {
      columnClass: 'col-md-2 col-sm-4 hidden-xs small-hpadding',
      text: 'Team'
    },
    {
      columnClass: 'col-md-3 hidden-sm hidden-xs small-hpadding',
      text: 'Owned By'
    },
    {
      columnClass: 'col-md-2 col-sm-2 col-xs-2 text-center small-hpadding',
      text: 'G'
    }
  ];

  $scope.allRequest = [];

  $scope.consolidatedGoalScorers = [];

  $scope.changeLeague = function (league) {
    //
  };

  var allLeaguesObj = {};

  $scope.updateData = function () {

    console.log('updateData');

    var allLeagues = [];

    // makes a request for all leagues in a loop returns a list of promises
    var allPromises = $apiFactory.getAllLeagues();

    // waits for an array of promises to resolve, sets allLeagues data
    $apiFactory.listOfPromises(allPromises, function (result) {

      allLeagues = [];

      result.forEach(function (league, index) {
        var goalsMap = league.data.goals.map($arrayMappers.goalsMap.bind($arrayMappers, league.leagueURL));
        allLeagues.push({
          name: league.leagueName,
          source: goalsMap
        });
        $scope.consolidatedGoalScorers = $scope.consolidatedGoalScorers.concat(goalsMap);
      });

      $scope.allLeagues = allLeagues;
      console.log('$scope.allLeague', $scope.allLeagues);
      //console.log('$scope.consolidatedGoalScorers', $scope.consolidatedGoalScorers);

      allRequestComplete();

    });

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

  var allRequestComplete = function () {

    $scope.loading = false;

    $scope.selectedLeague = $scope.allLeagues[0];

    var saveObject = {
      LIGA: $scope.allLeagues[0].source,
      EPL: $scope.allLeagues[1].source,
      SERI: $scope.allLeagues[2].source,
      CHLG: $scope.allLeagues[3].source,
      UEFA: $scope.allLeagues[4].source
    };

    $fireBaseService.syncLeagueData(saveObject);

  };

  $scope.init();

});
