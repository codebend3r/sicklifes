/**
 * Created by Bouse on 10/24/2014
 */


sicklifesFantasy.controller('standingsCtrl', function ($scope, $apiFactory, $routeParams, $fireBaseService, $arrayMappers, $objectUtils, $arrayLoopers, $dateService, $textManipulator, $scoringLogic, $managersService, $location) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

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
   * consolidated list of all owned players by a manager
   */
  $scope.allLeagues = null;

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  /**
   * TODO
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');

    $scope.loading = false;

    populateTable();

  };

  /**
   * DEPCRECATED
   */
  /*var populateTable = function () {

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

    //$apiFactory.listOfPromises(masterDeferredList, $scope.saveToFireBase);

    console.log('masterDeferredList.length', masterDeferredList.length);

    $apiFactory.listOfPromises(masterDeferredList, function () {
      console.log('ALL DONE');
    });

  };*/

  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'standingsCtrl',
      _lastSynedOn: $dateService.syncDate(),
      chester: $scope.allManagers[0],
      frank: $scope.allManagers[1],
      dan: $scope.allManagers[2],
      justin: $scope.allManagers[3],
      mike: $scope.allManagers[4],
      joe: $scope.allManagers[5]
    };

    $fireBaseService.syncLeagueTeamData(saveObject);

  };

  /**
   * call when firebase data has loaded
   * defines $scope.allManagers
   * @param data
   */
  var fireBaseLoaded = function (data) {

    $scope.loading = false;

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    console.log('syncDate allPlayersData', data.allPlayersData._lastSynedOn);
    console.log('syncDate leagueData', data.leagueData._lastSynedOn);
    console.log('syncDate managersData', data.managersData._lastSyncedOn);
    console.log('$scope.allManagers', $scope.allManagers);

  };

  /**
   * TODO
   */
  var init = function () {

    $fireBaseService.initialize();
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);


  };

  init();

});
