/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $routeParams, $arrayMapper, $filter, $textManipulator, $scoringLogic, $leagueTeams, $location, localStorageService) {

  $scope.loading = true;

  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-xs-4 small-hpadding',
      hoverTitle: 'Team',
      text: 'Team'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Domestic Goals',
      text: 'DG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Champions League Goals',
      text: 'CLG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Europa League Goals',
      text: 'EG'
    },
    {
      columnClass: 'col-md-2 col-xs-2 text-center small-hpadding',
      hoverTitle: 'Total Points',
      text: 'PTS'
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
  $scope.allRequestComplete = function () {

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

    $scope.populateTable();

  };

  /**
   *
   */
  $scope.populateTable = function () {

    $scope.allTeams.forEach(function (team) {

      team.totalPoints = 0;

      team.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, team));

    });

    //localStorageService.set('allTeams', $scope.allTeams);

  };

  $scope.updateData = function() {
    $scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);
  }

  /**
   *
   */
  $scope.init = function () {

    /*$scope.allLeagueDataObj = {
      cb: $scope.allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);*/

    if (localStorageService.get('allLeagues')) {

      /*$scope.allLeaguesData = localStorageService.get('allLeagues');
      $scope.allRequestComplete();*/
      $scope.updateData();

    } else {

      $scope.updateData();

    }

  };


  $scope.init();

});