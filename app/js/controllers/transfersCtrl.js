/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $timeout, $fireBaseService, $apiFactory, $objectUtils, $modal, $updateDataUtils, $momentService, $localStorage, $stateParams, $location) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'playerPoolData';

      /**
       * if data is still loading
       */
      $scope.loading = true;

      /**
       * if admin buttons will show
       * @type {boolean}
       */
      $scope.admin = $location.search().admin;

      /**
       * if manually adding players to roster
       * @type {boolean}
       */
      $rootScope.draftMode = $location.search().draftMode;

      /**
       * header for table
       * @type {{columnClass: string, text: string}[]}
       */
      $scope.tableHeader = [
        {
          text: 'ID'
        },
        {
          text: 'Player'
        },
        {
          text: 'Owned By'
        },
        {
          text: 'League'
        },
        {
          text: 'Team'
        }
      ];

      /**
       * TODO
       * @type {*[]}
       */
      $scope.managersTableHeader = [
        {
          text: 'Player',
          hoverText: 'Player',
          orderCriteria: 'player'
        },
        {
          text: 'Team',
          hoverText: 'Team',
          orderCriteria: 'team'
        },
        {
          text: 'League',
          hoverText: 'League Goals',
          orderCriteria: 'league'
        },
        {
          text: 'DG',
          hoverText: 'Domestic Goals',
          orderCriteria: 'domestic'
        },
        {
          text: 'LG',
          hoverText: 'Champions League Goals',
          orderCriteria: 'champions'
        },
        {
          text: 'P',
          hoverText: 'Total Points',
          orderCriteria: 'points()'
        }
      ];

      /**
       * TODO
       * @type {Array}
       */
      $rootScope.allPlayers = [];

      /**
       * TODO
       * @type {null}
       */
      $scope.updatePlayerPoolData = null;

      /**
       * TODO
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
       * populates $rootScope.managersData
       * @param data
       */
      var populateManagersData = function (data) {

        $scope.managersData = [
          data.chester,
          data.frank,
          data.dan,
          data.justin,
          data.mike,
          data.joe
        ];

        $rootScope.managersData = $scope.managersData;

        return {
          data: $scope.managersData,
          _lastSyncedOn: $momentService.syncDate()
        };

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
       * open modal
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
      //var dataLoaded = function (data) {
      //
      //  console.log('///////////////////');
      //  console.log('$HTTP --> data:', data);
      //  console.log('///////////////////');
      //
      //  if (angular.isUndefined($rootScope.managersData)) {
      //    $rootScope.managersData = [
      //      data.managersData.chester,
      //      data.managersData.frank,
      //      data.managersData.dan,
      //      data.managersData.justin,
      //      data.managersData.mike,
      //      data.managersData.joe
      //    ];
      //  }
      //
      //  if (angular.isUndefined($rootScope.playerPoolData)) {
      //    $rootScope.playerPoolData = data.playerPoolData;
      //  }
      //
      //  if (angular.isUndefined($rootScope.allLeagueTeamsData)) {
      //    $rootScope.allLeagueTeamsData = data.allLeagueTeamsData;
      //  }
      //
      //  console.log('$rootScope.managersData', $rootScope.managersData);
      //  console.log('$rootScope.playerPoolData', $rootScope.playerPoolData);
      //  console.log('$rootScope.allLeagueTeamsData', $rootScope.allLeagueTeamsData);
      //
      //  $scope.updateAllManagerData = $updateDataUtils.updateAllManagerData;
      //
      //  chooseTeam();
      //
      //  $scope.loading = false;
      //
      //};

      /**
       * defines $scope.selectedManager
       */
      var chooseTeam = function () {

        if ($stateParams.manager) {
          _.each($rootScope.managersData, function (manager) {
            if (manager.managerName === $stateParams.manager) {
              $scope.selectedManager = manager;
            }
          });
        } else {
          $scope.selectedManager = $rootScope.managersData[0];
        }

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

        $scope.startFireBase(function (firebaseData) {

          populateManagersData(firebaseData.managersData);
          chooseTeam();

        });

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

          console.log('///////////////////');

          $scope.allPlayers = result;

          $scope.startFireBase(function (firebaseData) {

            $rootScope.fireBaseReady = true;

            //console.log('firebaseData', firebaseData[dataKeyName]);
            populateManagersData(firebaseData.managersData);
            chooseTeam();

            var saveObject = {
              _syncedFrom: 'transfersCtrl',
              _lastSyncedOn: $momentService.syncDate(),
              allPlayers: $scope.allPlayers
            };

            $scope.saveToFireBase(saveObject, dataKeyName);

          });

          console.log('///////////////////');

        });

      };

      /**
       * init function
       */
      var init = function () {

        console.log('transfersCtrl - init', dataKeyName);

        if (angular.isDefined($rootScope[dataKeyName])) {

          console.log('load from $rootScope');
          loadFromLocal($rootScope[dataKeyName]);

        } else if (angular.isDefined($localStorage[dataKeyName])) {

          console.log('load from local storage');
          loadFromLocal($localStorage[dataKeyName]);

        } else {

          console.log('load from firebase');

          $scope.startFireBase(function (firebaseData) {

            console.log('firebaseData', firebaseData[dataKeyName]);

            $scope.fireBaseReady = true;
            $scope.loading = false;
            $scope.allPlayers = firebaseData[dataKeyName].allPlayers;

          });

        }

      };

      init();

    });

})();