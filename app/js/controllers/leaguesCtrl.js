/**
 * Created by Bouse on 11/03/2014
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $apiFactory, $q, $leagueTeams, $routeParams, $location, $arrayMappers, $textManipulator, $fireBaseService) {

  //////////////////////////// public

  $scope.loading = true;
  
  $scope.admin = $routeParams.admin;

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
          name: $textManipulator.properLeagueName(league.leagueName),
          source: goalsMap
        });
        $scope.consolidatedGoalScorers = $scope.consolidatedGoalScorers.concat(goalsMap);
      });

      $scope.allLeagues = allLeagues;
      allRequestComplete();

    });

  };
  
  var baseAllLeagues = [
    {
      name: 'LA LIGA',
      source: null,
      img: '/images/leagues/liga.png'
    },
    {
      name: 'ENGLISH PREMIER LEAGUE',
      source: null,
      img: '/images/leagues/epl.png'
    },
    {
      name: 'SERIE A',
      source: null,
      img: '/images/leagues/seriea.png'
    },
    {
      name: 'CHAMPIONS LEAGUE',
      source: null,
      img: '/images/leagues/chlg.png'
    },
    {
      name: 'EUROPA LEAGUE',
      source: null,
      img: '/images/leagues/europa.png'
    }
  ];

  $scope.init = function () {

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(function (data) {

      $scope.loading = false;

      $scope.allLeagues = [
        {
          name: baseAllLeagues[0].name,
          source: data.leagueData.LIGA,
          img: './images/leagues/liga.png'
        },
        {
          name: baseAllLeagues[1].name,
          source: data.leagueData.EPL,
          img: './images/leagues/epl.png'
        },
        {
          name: baseAllLeagues[2].name,
          source: data.leagueData.SERI,
          img: './images/leagues/seriea.png'
        },
        {
          name: baseAllLeagues[3].name,
          source: data.leagueData.CHLG,
          img: './images/leagues/chlg.png'
        },
        {
          name: baseAllLeagues[4].name,
          source: data.leagueData.UEFA,
          img: './images/leagues/europa.png'
        }
      ];

      $scope.selectedLeague = $scope.allLeagues[0];
      
      console.log('$scope.allLeagues', $scope.allLeagues);


    });

  };
  
  $scope.saveToFireBase = function() {
    
    var allLeagues = angular.copy($scope.allLeagues);
    
    console.log('////////////////////////////////////');
    console.log('allManagers', allLeagues);
    console.log('////////////////////////////////////');
      
    var saveObject = {
      LIGA: allLeagues[0].source,
      EPL: allLeagues[1].source,
      SERI: allLeagues[2].source,
      CHLG: allLeagues[3].source,
      UEFA: allLeagues[4].source
    };

    $fireBaseService.syncLeagueData(saveObject);;

  };
  
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  
  var allLeaguesObj = {};

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
