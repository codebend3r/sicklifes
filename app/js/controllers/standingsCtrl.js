/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $routeParams, $fireBaseService, $arrayMapper, $filter, $textManipulator, $scoringLogic, $leagueTeams, $location, localStorageService) {


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

    populateTable();

  };

  /**
   *
   */
  var populateTable = function () {

    console.log('populateTable', allTeams);

    var masterDeferredList = [];

    // 1st loop
    $scope.allTeams.forEach(function (team) {

      team.totalPoints = 0;

      // clear team deferred before the loop that populates it
      team.deferredList = [];

      // 2nd loop
      team.players.forEach($arrayMapper.forEachPlayer.bind($scope, $scope, team));

      masterDeferredList = masterDeferredList.concat(team.deferredList);

      team.deferredList = [];

    });

    console.log('END --> masterDeferredList.length:', masterDeferredList.length);

    $q.all(masterDeferredList).then(function () {

      $fireBaseService.syncLeagueTeamData();
      localStorageService.set('allTeams', $scope.allTeams);

    }, function () {

      console.log('********** ERROR');

    });


  };


  $scope.updateData = function () {

    console.log('updateData');

    $scope.allLeagueDataObj = {
      cb: allRequestComplete
    };

    $scope.allLeaguesData = $apiFactory.getAllLeagues($scope.allLeagueDataObj);

  };

  /**
   *
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

    });


  };


  $scope.init();

});
