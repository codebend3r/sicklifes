/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.controller('transfersCtrl', function ($scope, $rootScope, $q, localStorageService, $timeout, $fireBaseService, $apiFactory, $objectUtils, $modal, $updateDataUtils, $dateService, $routeParams) {

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
    console.log('$scope.allPlayers', $rootScope.allPlayers, '|', $rootScope.allPlayers.length);
    console.log('////////////////////////////////////');

    var allPlayersObject = {
      _lastSyncedOn: $dateService.syncDate(),
      allPlayers: $rootScope.allPlayers
    };

    $fireBaseService.syncPlayerPoolData(allPlayersObject);

    ////////////////////////////////

    var saveObject = {
      _lastSyncedOn: $dateService.syncDate(),
      chester: $rootScope.managersData[0],
      frank: $rootScope.managersData[1],
      dan: $rootScope.managersData[2],
      justin: $rootScope.managersData[3],
      mike: $rootScope.managersData[4],
      joe: $rootScope.managersData[5]
    };

    $fireBaseService.syncManagersData(saveObject);

  };

  $rootScope.allPlayers = [];

  /**
   *
   * @type {null}
   */
  $scope.updatePlayerPoolData = null;

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
    _.some($scope.selectedManager.players, function (eachPlayer) {
      if (eachPlayer.id === $scope.droppedPlayerObject.id) {
        eachPlayer.status = 'dropped';
        eachPlayer.dateOfTransaction = $dateService.transactionDate();
        return true;
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

    $rootScope.managersData.forEach(function (manager) {

      manager.players.forEach(function (eachPlayer) {

      });

    });

    console.log('>> $rootScope.managersData', $rootScope.managersData);

  };

  /**
   * call from when $rootScope, localstorage, or firebase data is loaded
   * @param data - data passed from promise
   */
  var dataLoaded = function (data) {

    console.log('transfersCtrl - dataLoaded', data);

    if (angular.isUndefined($rootScope.managersData)) {
      $rootScope.managersData = [
        data.managersData.chester,
        data.managersData.frank,
        data.managersData.dan,
        data.managersData.justin,
        data.managersData.mike,
        data.managersData.joe
      ];
    }

    if (angular.isUndefined($rootScope.playerPoolData)) {
      $rootScope.playerPoolData = data.playerPoolData;
    }

    if (angular.isUndefined($rootScope.allLeagueTeamsData)) {
      $rootScope.allLeagueTeamsData = data.allLeagueTeamsData;
    }

    console.log('$rootScope.managersData', $rootScope.managersData);
    console.log('$rootScope.playerPoolData', $rootScope.playerPoolData);
    console.log('$rootScope.allLeagueTeamsData', $rootScope.allLeagueTeamsData);

    $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;

    chooseTeam();

    $scope.loading = false;

  };

  /**
   * callback data when firebase is loaded
   */
  /*var fireBaseLoaded = function (data) {

    console.log('fireBaseLoaded -- transfersCtrl');

    $rootScope.allPlayers = data.playerPoolData.allPlayers;

    $rootScope.managersData = [
      data.managersData.chester,
      data.managersData.frank,
      data.managersData.dan,
      data.managersData.justin,
      data.managersData.mike,
      data.managersData.joe
    ];

    console.log('syncDate playerPoolData:', data.playerPoolData._lastSyncedOn);
    console.log('syncDate leagueData:', data.leagueData._lastSyncedOn);
    console.log('syncDate managersData:', data.managersData._lastSyncedOn);

    //$scope.updatePlayerPoolData = $updateDataUtils.updatePlayerPoolData.bind($scope, $rootScope.managersData, $rootScope.allPlayers, onAllPlayersLoaded);
    $scope.updatePlayerPoolData = function() {

      $updateDataUtils.updatePlayerPoolData()
        .then(function (result) {
          console.log('============================');
          console.log('player pool data updated', result);
          console.log('============================');
        });

    };

    chooseTeam();

    $scope.loading = false;

  };*/

  /**
   * defines $scope.selectedManager
   */
  var chooseTeam = function () {

    if ($routeParams.manager) {
      $rootScope.managersData.forEach(function (manager) {
        if (manager.managerName === $routeParams.manager) {
          $scope.selectedManager = manager;
        }
      });
    } else {
      $scope.selectedManager = $rootScope.managersData[0];
    }
    $scope.selectedPlayers = $scope.selectedManager.players;

  };

  /**
   * retrieve data from $rootScope
   */
  var getFromRootScope = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromRootScope');
    if (angular.isDefined($rootScope.managersData) && angular.isDefined($rootScope.playerPoolData) && angular.isDefined($rootScope.allLeagueTeamsData)) {
      defer.resolve({
        managersData: $rootScope.managersData,
        playerPoolData: $rootScope.playerPoolData,
        allLeagueTeamsData: $rootScope.allLeagueTeamsData
      });
    } else {
      defer.reject();
    }
    return defer.promise;

  };

  /**
   * retrieve data from local storage
   */
  var getFromLocalStorage = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromLocalStorage');
    if (angular.isDefined(localStorageService.get('managersData')) && angular.isDefined(localStorageService.get('playerPoolData')) && angular.isDefined(localStorageService.get('allLeagueTeamsData'))) {
      defer.resolve({
        managersData: localStorageService.get('managersData'),
        playerPoolData: localStorageService.get('playerPoolData'),
        allLeagueTeamsData: localStorageService.get('allLeagueTeamsData')
      });
    } else {
      defer.reject();
    }
    return defer.promise;

  };

  /**
   * retrieve data from firebase
   */
  var getFromFireBase = function () {

    var defer = $q.defer();
    console.log('managersCtrl - getFromFireBase');

    $fireBaseService.initialize($scope);
    var firePromise = $fireBaseService.getFireBaseData();
    firePromise.then(function (result) {
      defer.resolve(result);
    }, function () {
      defer.reject();
    });

    return defer.promise;

  };


  /**
   * all requests complete
   */
  var allRequestComplete = function () {

    console.log('allRequestComplete');
    $scope.loading = false;
    chooseTeam();

  };

  /**
   * init function
   */
  var init = function () {

    console.log('managersCtrl - init');

    var dataLoad = false;

    $updateDataUtils.updateEverything();

    /*getFromRootScope()
      .then(function (result) {
        console.log('1. $rootScope success');
        dataLoaded(result);
        dataLoad = true;
      }, function () {
        console.log('1. $rootScope fail - get from localstorage');
        return getFromLocalStorage();
      })
      .then(function (result) {
        if (!dataLoad) {
          console.log('2. localstorage success');
          dataLoaded(result);
          dataLoad = true;
        }
      }, function () {
        console.log('2. localstorage fail - get from firebase');
        return getFromFireBase();
      })
      .then(function (result) {
        if (!dataLoad) {
          console.log('3. if no localstorage - firebase loaded');
          dataLoaded(result);
          dataLoad = true;
        }
      })*/

  };

  init();

});
