/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $q, $routeParams, $fireBaseService, $arrayMappers, $arrayLoopers, $date, $filter, $textManipulator, $scoringLogic, $leagueTeams, $location) {

  /**
   * TODO
   */
  $scope.loading = true;

  $scope.admin = $routeParams.admin;

  /**
   * TODO
   */
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
   * consolidated list of all owned players by a manager
   */
  $scope.allLeagues = null;

  /**
   * TODO
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

    populateTable();

  };

  /**
   * TODO
   */
  var populateTable = function () {

    console.log('populateTable', $scope.allManagers);

    var masterDeferredList = [];

    // 1st loop
    $scope.allManagers.forEach(function (team) {

      team.totalPoints = 0;

      // clear team deferred before the loop that populates it
      team.deferredList = [];

      // 2nd loop
      team.players.forEach($arrayLoopers.forEachPlayer.bind($scope, $scope, team));

      masterDeferredList = masterDeferredList.concat(team.deferredList);

      team.deferredList = [];

    });

    $apiFactory.listOfPromises(masterDeferredList, function () {

      console.log('deferredList COMPLETE');

      var saveObject = {
        _syncedFrom: 'standingsCtrl',
        _lastSyncedOn: $dateService.syncDate(),
        chester: $scope.$leagueTeams.chester,
        frank: $scope.$leagueTeams.frank,
        dan: $scope.$leagueTeams.dan,
        justin: $scope.$leagueTeams.justin,
        mike: $scope.$leagueTeams.mike,
        joe: $scope.$leagueTeams.joe
      };

      $fireBaseService.syncLeagueTeamData(saveObject);

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
        allLeagues = allLeagues.concat(goalsMap);
      });

      $scope.allLeagues = allLeagues;

      allRequestComplete();

    });

  };

  /**
   * TODO
   */
  var init = function () {

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

    });


  };


  init();

});
