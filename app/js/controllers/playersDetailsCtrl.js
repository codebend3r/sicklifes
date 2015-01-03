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
   * save data to firebase
   */
  var saveToFirebase = function () {

    console.log('//////////////////////////////////////////');
    console.log('$scope.allManagers', $scope.allManagers);
    console.log('//////////////////////////////////////////');

    var saveObject = {
      _syncedFrom: 'playersDetailsCtrl',
      _lastSyncedOn: $dateService.syncDate(),
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

    console.log('fireBaseLoaded -- playersDetailsCtrl');

    $scope.loading = false;
    
    $scope.allPlayers = data.allPlayersData.allPlayers;

    $scope.allManagers = {
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

  var onRequestFinished = function() {

    console.log('>> 2 CURRENT PLAYER:', $scope.player);

  };

  var findPlayerByID = function () {

    $scope.allPlayers.some(function (player) {
      if (player.id === id) {
        $scope.player = player;
        return true;
      }
    });

    console.log('>> 1 CURRENT PLAYER:', $scope.player);
    console.log('>> 1 MANAGER NAME:', $scope.player.managerName);

    var manager = $scope.allManagers[$scope.player.managerName] || null,
      playerProfileRequest;

    $scope.player = $objectUtils.playerResetGoalPoints($scope.player);

    playerProfileRequest = $apiFactory.getPlayerProfile('soccer', $scope.player.id);

    // populates data related to player info like place of birth
    playerProfileRequest.promise.then($arrayMappers.playerInfo.bind(this, $scope.player, onRequestFinished));

    // populates game logs data
    playerProfileRequest.promise.then($arrayMappers.playerGamesLog.bind(this, { player: $scope.player, manager: manager }));

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