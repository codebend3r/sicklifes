/**
 * Created by Bouse on 01/01/2015
 */

sicklifesFantasy.controller('leaguesCtrl', function ($scope, $timeout, $apiFactory, $date, $managersService, $location, $routeParams, $updateDataUtils, $arrayMappers, $dateService, $textManipulator, $fireBaseService) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

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

  $scope.changeLeague = function (league) {
    //
  };

  $scope.updateLeaguesData = null;


  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allLeagues:', $scope.allLeagues);
    console.log('$scope.allLeagues[0].source:', $scope.allLeagues[0].source);
    console.log('$scope.allLeagues[0].source[0]:', $scope.allLeagues[0].source[0]);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'leaguesCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      LIGA: $scope.allLeagues[0].source,
      EPL: $scope.allLeagues[1].source,
      SERI: $scope.allLeagues[2].source,
      CHLG: $scope.allLeagues[3].source,
      UEFA: $scope.allLeagues[4].source
    };

    $fireBaseService.syncLeagueData(saveObject);


  };

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  var allLeaguesObj = {};

  var onLeaguesUpdated = function (allLeagues) {

    $scope.allLeagues = allLeagues;
    $scope.selectedLeague = $scope.allLeagues[0];

  };

  var fireBaseLoaded = function (data) {

    $scope.loading = false;

    $scope.allLeagues = [
      {
        name: $textManipulator.leagueLongNames.liga,
        source: data.leagueData.LIGA,
        className: 'liga',
        img: $textManipulator.leagueImages.liga
      },
      {
        name: $textManipulator.leagueLongNames.epl,
        source: data.leagueData.EPL,
        className: 'epl',
        img: $textManipulator.leagueImages.epl
      },
      {
        name: $textManipulator.leagueLongNames.seri,
        source: data.leagueData.SERI,
        className: 'seri',
        img: $textManipulator.leagueImages.seri
      },
      {
        name: $textManipulator.leagueLongNames.chlg,
        source: data.leagueData.CHLG,
        className: 'chlg',
        img: $textManipulator.leagueImages.chlg
      },
      {
        name: $textManipulator.leagueLongNames.euro,
        source: data.leagueData.UEFA,
        className: 'europa',
        img: $textManipulator.leagueImages.euro
      }
    ];

    var allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    $scope.selectedLeague = $scope.allLeagues[0];

    var syncDate = $date.create(data.leagueData._lastSynedOn);

    console.log('syncDate allPlayersData:', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData:', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData:', data.managersData._lastSyncedOn);

    $scope.updateLeaguesData = $updateDataUtils.updateLeaguesData.bind($scope, allManagers, onLeaguesUpdated);

    if (syncDate.isYesterday()) {
      $scope.updateData();
    }

  };

  var init = function () {

    console.log('leaguesCtrl - init');
    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);

  };

  $timeout(init, 250);

});
