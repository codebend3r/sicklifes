/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.controller('transfersCtrl', function ($scope, $timeout, $fireBaseService, $apiFactory, $objectUtils, $modal, $updateDataUtils, $dateService, $routeParams) {

  ////////////////////////////////////////
  /////////////// public /////////////////
  ////////////////////////////////////////

  /**
   * TODO
   */
  $scope.loading = true;

  /**
   * route param
   * @type {*|$scope.admin}
   */
  $scope.admin = $routeParams.admin;

  /**
   * header for table
   * @type {{columnClass: string, text: string}[]}
   */
  $scope.tableHeader = [
    {
      columnClass: 'col-md-1 col-sm-2 col-xs-2',
      text: 'ID'
    },
    {
      columnClass: 'col-md-3 col-sm-4 col-xs-4',
      text: 'Player'
    },
    {
      columnClass: 'col-md-3 col-sm-3 hidden-xs',
      text: 'Owned By'
    },
    {
      columnClass: 'col-md-2 hidden-sm hidden-xs',
      text: 'League'
    },
    {
      columnClass: 'col-md-3 col-sm-3 col-xs-6',
      text: 'Team'
    }
  ];

  $scope.managersTableHeader = [
    {
      columnClass: 'col-md-4 col-sm-5 col-xs-6',
      text: 'Player',
      hoverText: 'Player',
      orderCriteria: 'player'
    },
    {
      columnClass: 'col-md-3 col-sm-4 hidden-xs',
      text: 'Team',
      hoverText: 'Team',
      orderCriteria: 'team'
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

  /**
   * save data to firebase
   */
  $scope.saveToFireBase = function () {

    console.log('////////////////////////////////////');
    console.log('$scope.allPlayers', $scope.allPlayers, '|', $scope.allPlayers.length);
    console.log('////////////////////////////////////');

    var allPlayersObject = {
      _syncedFrom: 'transfersCtrl',
      _lastSyncedOn: $dateService.syncDate(),
      allPlayers: $scope.allPlayers
    };

    $fireBaseService.syncAllPlayersList(allPlayersObject);

  };

  $scope.allPlayers = [];

  $scope.updatePlayerPoolData = $updateDataUtils.updatePlayerPoolData.bind($scope, $scope.allPlayers);

  /**
   *
   * @type {object}
   */
  $scope.selectedPlayers = null;

  /**
   * {ng-click} - when manager option changes
   */
  $scope.changeManager = function (selectedManager) {

    $scope.selectedManager = selectedManager;
    $scope.selectedPlayers = selectedManager.players;
    console.log('$scope.selectedPlayers', $scope.selectedPlayers);

  };

  /**
   *
   */
  $scope.addPlayer = function (player) {

    //console.log('addPlayer --> player', player);
    player.managerName = $scope.selectedManager.managerName;
    player.transactionType = 'ADD';
    $scope.openModal(player);

  };

  /**
   *
   */
  $scope.dropPlayer = function (player) {

    //console.log('dropPlayer --> player', player);
    player.managerName = $scope.selectedManager.managerName;
    player.transactionType = 'DROP';
    $scope.openModal(player);

  };

  /**
   *
   * @type {string}
   */
  $scope.addedPlayerImage = '';

  /**
   *
   * @type {string}
   */
  $scope.droppedPlayerImage = '';

  /**
   * whether a player has been added to a roster
   * @type {boolean}
   */
  $scope.transactionPlayerAdded = false;

  /**
   * whether a player has been removed from a roster
   * @type {boolean}
   */
  $scope.transactionPlayerRemoved = false;

  /**
   * saves the added and dropped players to the current manager's roster
   */
  $scope.saveRoster = function () {

    if (!angular.isDefined($scope.selectedManager.transactions)) {
      $scope.selectedManager.transactions = [];
    }

    $scope.selectedManager.transactions.push({

      drop: $scope.droppedPlayerObject,
      add: $scope.addedPlayerObject

    });

    // add
    $scope.selectedManager.players.push($objectUtils.cleanPlayer($scope.addedPlayerObject));

    // drop
    $scope.selectedManager.players.forEach(function (eachPlayer) {
      if (eachPlayer.id === $scope.droppedPlayerObject.id) {
        eachPlayer.status = 'dropped';
        eachPlayer.dateOfTransaction = $dateService.transactionDate();
      }
    });

    console.log('///////////////////////////////////////////');
    console.log('$scope.selectedManager', $scope.selectedManager);
    console.log('///////////////////////////////////////////');

  };

  /**
   *
   */
  $scope.openModal = function (player) {

    var modalInstance = $modal.open({
      templateUrl: './views/modal/transfer-window.html',
      controller: 'transferWindowCtrl',
      resolve: {
        playerObject: function () {
          return player;
        }
      }
    });

    modalInstance.result.then(function (selectedPlayer) {

      if (selectedPlayer.transactionType === 'ADD') {
        console.log('ADDING PLAYER');
        $scope.transactionPlayerAdded = true;
        $scope.addedPlayerObject = $objectUtils.cleanPlayer(selectedPlayer);
        $scope.addedPlayerObject.status = 'added';
        if (angular.isDefined($scope.addedPlayerObject.ownedBy)) delete $scope.addedPlayerObject.ownedBy;

      } else if (selectedPlayer.transactionType === 'DROP') {
        console.log('REMOVING PLAYER');
        $scope.transactionPlayerRemoved = true;
        $scope.droppedPlayerObject = $objectUtils.cleanPlayer(selectedPlayer);
        $scope.droppedPlayerObject.status = 'dropped';
        if (angular.isDefined($scope.droppedPlayerObject.ownedBy)) delete $scope.droppedPlayerObject.ownedBy;

      }

    }, function () {
      console.log('Modal dismissed');
    });

  };

  $scope.resetAllPlayers = function () {

    $scope.allManagers.forEach(function (manager) {

      manager.players.forEach(function (eachPlayer) {

      });

    });

    console.log('>> $scope.allManagers', $scope.allManagers);

  };

  var onAllPlayersLoaded = function (allPlayers) {
    $scope.allPlayers = allPlayers;
  };

  /**
   * callback data when firebase is loaded
   */
  var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded -- transfersCtrl');

    $scope.allPlayers = data.allPlayersData.allPlayers;

    $scope.allManagers = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    console.log('syncDate allPlayersData:', data.allPlayersData._lastSyncedOn);
    console.log('syncDate leagueData:', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData:', data.managersData._lastSyncedOn);

    $scope.updatePlayerPoolData = $updateDataUtils.updatePlayerPoolData.bind($scope, $scope.allManagers, $scope.allPlayers, onAllPlayersLoaded);

    $scope.selectedManager = $scope.allManagers[0];
    $scope.selectedPlayers = $scope.selectedManager.players;

    $scope.loading = false;

  };

  /**
   * init controller
   */
  var init = function () {

    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.promise.then(fireBaseLoaded);


  };

  $timeout(init, 250);

});
