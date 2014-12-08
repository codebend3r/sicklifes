/**
 * Updated by Bouse on 12/06/2014
 */


sicklifesFantasy.controller('playersDetailsCtrl', function ($scope, $apiFactory, $location, $routeParams, $arrayMappers, $textManipulator, $managersService, $date, $dateService, $fireBaseService) {

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
   * TODO
   */
  $scope.inLiga = false;

  /*
   * TODO
   */
  $scope.inEPL = false;

  /*
   * TODO
   */
  $scope.inSeri = false;

  /*
   * TODO
   */
  $scope.inChlg = false;

  /*
   * TODO
   */
  $scope.inEuro = false;

  /*
   * TODO
   */
  $scope.player = {};


  /*
   * go through all players in  all the managers and update the player details
   */
  $scope.getAllGameLogs = function () {

    $scope.allManagers.forEach(function (manager) {

      manager.players.forEach(function (player) {

        var ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
          eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
          seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
          chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
          euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

        player.gamesLog = [];

        ligaGamesRequest.promise.then(function (result) {
          var ligaGameDetails = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
          player.gamesLog = player.gamesLog.concat(ligaGameDetails);
        });


        eplGamesRequest.promise.then(function (result) {
          var eplGameDetails = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
          player.gamesLog = player.gamesLog.concat(eplGameDetails);
        });


        seriGamesRequest.promise.then(function (result) {
          var seriGameDetails = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
          player.gamesLog = player.gamesLog.concat(seriGameDetails);
        });


        chlgGamesRequest.promise.then(function (result) {
          var chlgGameDetails = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
          player.gamesLog = player.gamesLog.concat(chlgGameDetails);
        });


        euroGamesRequest.promise.then(function (result) {
          var euroGameDetails = result.data.filter($arrayFilter.filterAfterDate).map($arrayMappers.gameMapper);
          player.gamesLog = player.gamesLog.concat(euroGameDetails);
        });

      });

    });

  };

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

    console.log('fireBaseLoaded');

    $scope.loading = false;
    
    $scope.allPlayers = data.allPlayersData.allPlayers;

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];
    
    console.log('syncDate allPlayersData', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData', data.managersData._lastSyncedOn);

    findPlayerByID();
    
    var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', $scope.player.id);
    playerProfileRequest.promise.then($arrayMappers.playerInfo.bind(this, $scope.player));

  };

  var findPlayerByID = function () {

    $scope.allPlayers.some(function (manager) {
      if (player.id === id) {
        $scope.player = player;
        return true;
      }
    });

    console.log('>> CURRENT PLAYER', $scope.player);

  };

  /**
   * TODO
   */
  var id = Number($routeParams.playerID);

  /**
   * TODO
   */
  var init = function () {

    id = Number($routeParams.playerID);
    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);

  };

  init();

});