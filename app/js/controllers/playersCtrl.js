/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('playersCtrl', function ($scope, $apiFactory, $fireBaseService, $routeParams, $arrayMapper, $leagueTeams, $location) {

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
    $location.url($location.path() + '?team=' + selectedTeam.personName);

  };

  /**
   * all requests complete
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');

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

    chooseTeam();

    $scope.populateTable();

  };

  /**
   * defines $scope.selectedTeam
   */
  var chooseTeam = function () {

    if ($routeParams.team) {
      $scope.allTeams.forEach(function (team) {
        if (team.personName === $routeParams.team) {
          $scope.selectedTeam = team;
        }
      });
    } else {
      $scope.selectedTeam = $scope.allTeams[0];
    }

  };

  /**
   * builds table
   */
  $scope.populateTable = function () {

    console.log('$scope.populateTable');

    $scope.selectedTeam.deferredList = [];

    $scope.selectedTeam.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, $scope.selectedTeam));

    $q.all($scope.selectedTeam.deferredList).then(function () {

      $scope.selectedTeam.deferredList = [];
      $fireBaseService.syncLeagueTeamData();

    });

  };

  /**
   *
   */
  $scope.updateData = function () {
    $scope.allLeagueDataObj = {
      cb: allRequestComplete
    };
    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);
  };

  /**
   * init function
   */
  $scope.init = function () {

    // TODO - implement localStorage save
    /*if (localStorageService.get('allLeagues')) {

     } else {

     }*/

    $fireBaseService.initialize();

    var firePromise = $fireBaseService.getFireBaseData();

    firePromise.promise.then(function (data) {

      $scope.loading = false;

      $scope.allTeams = allTeams = [
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

  $scope.init();

});


