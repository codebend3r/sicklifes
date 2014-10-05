/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $routeParams, $arrayMapper, localStorageService, $leagueTeams, $location) {

  $scope.loading = true;

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

  $scope.changeTeam = function (selectedTeam) {

    console.log('change team', selectedTeam);
    $scope.selectedTeam = selectedTeam;
    //$scope.populateTable();
    //var newURL = '#/players/?team=' + selectedTeam.personName;
    //console.log('newURL', newURL);
    //$location.path(newURL);
    $location.url($location.path() + '?team=' + selectedTeam.personName);

  };

  /**
   * init function
   */
  $scope.init = function () {

    //localStorageService.clearAll();

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

    localStorageService.set('allTeams', $scope.allTeams);

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

  };

  $scope.init();

});


