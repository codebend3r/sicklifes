/**
 * Updated by Bouse on 12/06/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $timeout, $apiFactory, $location, $routeParams, $arrayMappers, $textManipulator, $objectUtils, $managersService, $date, $dateService, $fireBaseService) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  /*
   * TODO
   */
  $scope.loading = true;

  /*
   * TODO
   */
  $scope.admin = $routeParams.admin;

  /*
   * TODO
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-4 col-sm-4 col-xs-6',
      text: 'Opponent'
    },
    {
      columnClass: 'col-md-2 col-sm-1 col-xs-2 text-center',
      text: 'G'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs text-center',
      text: 'Final Score'
    },
    {
      columnClass: 'col-md-2 col-sm-3 hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-2 col-sm-3 col-xs-4',
      text: 'Date Played'
    }
  ];

  /*
   * player
   */
  $scope.player = {};

  /**
   * league images
   */
  $scope.leagueImages = $textManipulator.leagueImages;

  ////////////////////////////////////////
  ////////////// private /////////////////
  ////////////////////////////////////////

  /**
   * saves current data to firebase
   */
  var saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('managersData', managersData);
    console.log('////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'playerDetailsCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      chester: managersData.chester,
      frank: managersData.frank,
      dan: managersData.dan,
      justin: managersData.justin,
      mike: managersData.mike,
      joe: managersData.joe
    };

    $fireBaseService.syncManagersData(saveObject);

  };

  /**
   *
   * @type {{}}
   */
  var managersData = {};

  /**
   * call when firebase data has loaded
   * defines $scope.managersData
   * @param data
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded -- playersDetailsCtrl');

    $scope.loading = false;

    $scope.allPlayers = data.allPlayersData.allPlayers;

    managersData = {
      chester: data.managersData.chester,
      frank: data.managersData.frank,
      dan: data.managersData.dan,
      justin: data.managersData.justin,
      mike: data.managersData.mike,
      joe: data.managersData.joe
    };

    console.log('syncDate allPlayersData:', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData:', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData:', data.managersData._lastSyncedOn);

    findPlayerByID();

  };

  var onRequestFinished = function (data) {

    console.log('DATA:', data);
    //console.log('CURRENT PLAYER:', $scope.player);
    //console.log(data);

  };

  var findPlayerByID = function () {

    $scope.allPlayers.some(function (player) {
      if (player.id === id) {
        $scope.player = player;
        return true;
      }
    });

    var manager = managersData[$scope.player.managerName] || null;

    // results goal totals to zero
    $scope.player = $objectUtils.playerResetGoalPoints($scope.player);

    $apiFactory.getPlayerProfile('soccer', $scope.player.id)
      .then($arrayMappers.playerInfo.bind(this, $scope.player))
      .then($arrayMappers.playerGamesLog.bind(this, { player: $scope.player, manager: manager }))
      .then(function () {
        //console.log('6. player data ready to be saved');
        saveToFireBase();
      });

  };

  /**
   * id used to identify a player from thescore.ca api
   */
  var id = Number($routeParams.playerID);

  /**
   * init function
   */
  var init = function () {

    id = Number($routeParams.playerID);
    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);

  };

  $timeout(init, 250);

});
