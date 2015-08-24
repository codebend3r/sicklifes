/**
 * Updated by Bouse on 12/06/2014
 */

angular.module('sicklifes')

  .controller('transfersCtrl', function ($scope, $rootScope, $q, $timeout, $fireBaseService, $apiFactory, $objectUtils, $modal, $updateDataUtils, $momentService, $localStorage, $stateParams) {

    ////////////////////////////////////////
    /////////////// public /////////////////
    ////////////////////////////////////////

    var dataKeyName = 'playerPoolData';

    /**
     * if data is still loading
     */
    $scope.loading = true;

    /**
     * route param
     * @type {boolean}
     */
    $scope.admin = $stateParams.admin;

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
     * sets data in the initialized firebase service
     */
    $scope.saveToFireBase = function () {

      if ($scope.fireBaseReady) {

        console.log('////////////////////////////////////');
        console.log('$rootScope.allPlayers:', $rootScope.allPlayers);
        console.log('////////////////////////////////////');

        var saveObject = {
          _syncedFrom: 'transfersCtrl',
          _lastSyncedOn: $momentService.syncDate(),
          allPlayers: $rootScope.allPlayers
        };

        $fireBaseService.saveToFireBase(saveObject, dataKeyName);

      } else {

        startFireBase();

      }

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

      console.log('///////////////////');
      console.log('$HTTP --> data:', data);
      console.log('///////////////////');

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
     * read data from local storage
     * @param localData
     */
    var loadFromLocal = function (localData) {

      console.log('///////////////////');
      console.log('LOCAL --> localData:', localData);
      console.log('///////////////////');

      $scope.loading = false;

      $rootScope.allPlayers = localData.allPlayers;

    };

    /**
     * starts the process of getting data from firebase
     * @param callback
     */
    var startFireBase = function (callback) {

      console.log('--  firebase started --');
      if ($scope.fireBaseReady) {
        console.log('firebase previously loaded');
        callback();
      } else {
        $fireBaseService.initialize($scope);
        var firePromise = $fireBaseService.getFireBaseData();
        firePromise.then(callback);
      }

    };


    /**
     * all requests complete
     */
    var allRequestComplete = function () {

      console.log('transfersCtrl - allRequestComplete');
      $scope.loading = false;
      chooseTeam();

    };

    /**
     * http request all player pool
     */
    $scope.updatePlayerPoolData = function () {

      $updateDataUtils.updatePlayerPoolData(function (result) {
        console.log('============================');
        console.log('player pool data updated', result);
        $rootScope.allPlayers = result;
        console.log('============================');
      });

    };

    /**
     * init function
     */
    var init = function () {

      console.log('transfersCtrl - init');

      if (angular.isDefined($rootScope[dataKeyName])) {

        console.log('load from $rootScope');
        loadFromLocal($rootScope[dataKeyName]);

      } else if (angular.isDefined($localStorage[dataKeyName])) {

        console.log('load from local storage');
        loadFromLocal($localStorage[dataKeyName]);

      } else {

        console.log('load from firebase');

        startFireBase(function (firebaseData) {
          console.log('HTTP --> FIREBASE READY');
          $scope.fireBaseReady = true;
          $scope.loading = false;
          //$scope.saveToFireBase();
        });

      }

    };

    init();

  });
