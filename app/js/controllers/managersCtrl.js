/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('managersCtrl', function ($scope, $apiFactory, $fireBaseService, $routeParams, $arrayMappers, $arrayLoopers, localStorageService, $leagueTeams, $location) {

  /**
   * TODO
   */
  $scope.loading = true;

  /**
   * TODO
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-sm-5 col-xs-6',
      text: 'Player',
      hoverText: 'Player',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-3 col-sm-4 hidden-xs',
      text: 'Team',
      hoverText: 'Team',
      orderCriteria: ''
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'League',
      hoverText: 'League Goals',
      orderCriteria: 'league'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'DG',
      hoverText: 'Domestic Goals',
      orderCriteria: 'domestic'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'LG',
      hoverText: 'Champions League Goals',
      orderCriteria: 'champions'
    },
    {
      columnClass: 'col-md-1 col-sm-1 col-xs-2 text-center',
      text: 'P',
      hoverText: 'Total Points',
      orderCriteria: 'points()'
    }
  ];

  /**
   * TODO
   */
  $scope.changeTeam = function (selectedTeam) {

    console.log('change team', selectedTeam);
    $scope.selectedTeam = selectedTeam;
    $location.url($location.path() + '?team=' + selectedTeam.personName); // route change

  };

  /**
   * defines $scope.selectedTeam
   */
  var chooseTeam = function () {

    if ($routeParams.team) {
      $scope.allManagers.forEach(function (team) {
        if (team.personName === $routeParams.team) {
          $scope.selectedTeam = team;
        }
      });
    } else {
      $scope.selectedTeam = $scope.allManagers[0];
    }

    console.log('$scope.selectedTeam', $scope.selectedTeam);

    $location.url($location.path() + '?team=' + $scope.selectedTeam.personName); // route change

  };

  /**
   * builds table
   */
  $scope.populateTable = function () {

    console.log('$scope.populateTable');

    $scope.selectedTeam.deferredList = [];

    $scope.selectedTeam.players.forEach($arrayLoopers.forEachPlayer.bind($scope, $scope, $scope.selectedTeam));

    $q.all($scope.selectedTeam.deferredList).then(function () {

      $scope.selectedTeam.deferredList = [];
      $fireBaseService.syncLeagueTeamData();

    });

  };

  /**
   * called from ng-click, makes a request from TheScore to get new data
   */
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
        localStorageService.set(league.leagueName, goalsMap); // save each league also save to localStorage
        allLeagues = allLeagues.concat(goalsMap);
      });

      localStorageService.set('allLeagues', allLeagues); // also save to localStorage

      $scope.allLeagues = allLeagues;

      allRequestComplete();

    });

  };

  /**
   * init function
   */
  var init = function () {

    // TODO - implement localStorage save
    /*if (localStorageService.get('allLeagues')) {

     } else {

     }*/

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(function (data) {

      $scope.loading = false;

      $scope.allManagers = [
        data.leagueTeamData.chester,
        data.leagueTeamData.frank,
        data.leagueTeamData.dan,
        data.leagueTeamData.justin,
        data.leagueTeamData.mike,
        data.leagueTeamData.joe
      ];

      $scope.allPlayers = data.__allLeagues;

      chooseTeam();


    });

  };

  /**
   * all requests complete
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');

    $scope.loading = false;

    $scope.allManagers = [
      $leagueTeams.chester,
      $leagueTeams.frank,
      $leagueTeams.dan,
      $leagueTeams.justin,
      $leagueTeams.mike,
      $leagueTeams.joe
    ];

    chooseTeam();

    $scope.populateTable();

  };

  init();

});


