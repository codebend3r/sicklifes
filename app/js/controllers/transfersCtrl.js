/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $timeout, $fireBaseService, $apiFactory, $objectUtils, $modal, $updateDataUtils, $momentService, $localStorage, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      var dataKeyName = 'playerPoolData';

      var managerId = $stateParams.managerId ? $stateParams.managerId : 'chester';

      $rootScope.loading = true;

      /**
       * header for table
       * @type {{columnClass: string, text: string}[]}
       */
      //$scope.tableHeader = [
      //  {
      //    text: 'ID'
      //  },
      //  {
      //    text: 'Player'
      //  },
      //  {
      //    text: 'Owned By'
      //  },
      //  {
      //    text: 'League'
      //  },
      //  {
      //    text: 'Team'
      //  }
      //];

      /**
       * TODO
       * @type {*[]}
       */
      //$scope.managersTableHeader = [
      //  {
      //    text: 'Player',
      //    hoverText: 'Player',
      //    orderCriteria: 'player'
      //  },
      //  {
      //    text: 'Team',
      //    hoverText: 'Team',
      //    orderCriteria: 'team'
      //  },
      //  {
      //    text: 'League',
      //    hoverText: 'League Goals',
      //    orderCriteria: 'league'
      //  },
      //  {
      //    text: 'DG',
      //    hoverText: 'Domestic Goals',
      //    orderCriteria: 'domestic'
      //  },
      //  {
      //    text: 'LG',
      //    hoverText: 'Champions League Goals',
      //    orderCriteria: 'champions'
      //  },
      //  {
      //    text: 'P',
      //    hoverText: 'Total Points',
      //    orderCriteria: 'points()'
      //  }
      //];

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
       *
       */
      $scope.addPlayer = function (player) {

        if ($scope.draftMode) {

          var draftedPlayer = $objectUtils.cleanPlayer(player, $scope.draftMode);
          draftedPlayer.managerName = $scope.selectedManager.managerName;

          $scope.selectedManager.players = $scope.selectedManager.players || {};

          var pickNumber = _.keys($scope.selectedManager.players).length + 1;

          draftedPlayer.pickNumber = pickNumber;

          console.log('pick #', pickNumber);
          //$scope.selectedManager.players.push(draftedPlayer);
          $scope.selectedManager.players[draftedPlayer.id] = draftedPlayer;

          var saveObject = $scope.managersData;
          saveObject._lastSyncedOn = $momentService.syncDate();

          $scope.startFireBase(function () {

            $scope.saveToFireBase(saveObject, 'managersData');

          });

          //player.managerName = $scope.selectedManager.managerName;
          //player.transactionType = 'ADD';
          //$scope.openModal(player);

        }

      };

      /**
       *
       */
      $scope.dropPlayer = function (player) {

        console.log('dropPlayer --> player', player);
        //player.managerName = $scope.selectedManager.managerName;
        //player.transactionType = 'DROP';
        //$scope.openModal(player);

      };

      /**
       *
       * @type {{addPlayer: (Function|*), dropPlayer: (Function|*), draftMode: boolean}}
       */
      $scope.playersTableParams = {
        addPlayer: $scope.addPlayer,
        dropPlayer: $scope.dropPlayer,
        draftMode: $scope.draftMode
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

      /**
       * read data from local storage
       * @param localData
       */
      //var loadFromLocal = function (localData) {
      //
      //  console.log('///////////////////');
      //  console.log('LOCAL --> localData:', localData);
      //  console.log('///////////////////');
      //
      //  $rootScope.loading = false;
      //
      //  $scope.managerData = $scope.populateManagersData(localData);
      //
      //  $rootScope.allPlayers = localData.allPlayers;
      //
      //  $scope.startFireBase(function (firebaseData) {
      //
      //    $scope.fireBaseReady = true;
      //    //$scope.managerData = $scope.populateManagersData(firebaseData);
      //    $scope.chooseManager($stateParams.managerId);
      //    $scope.selectedManager = $scope.managersData[$stateParams.managerId];
      //    console.log('> managersData', $scope.managersData);
      //    console.log('> selectedManager', $scope.selectedManager);
      //
      //  });
      //
      //};

      /**
       * read data from firebase
       * @param result
       */
      var loadData = function (result) {

        console.log('///////////////////');
        console.log('result:', result);
        console.log('///////////////////');

        // define managerData on scope and $rootScope
        $scope.populateManagersData($rootScope.managersData.data);

        // define the current manager
        $scope.chooseManager(managerId);

        // define selectedManager by managerId
        $scope.selectedManager = $scope.managerData[managerId];

        $scope.allPlayers = $rootScope.playerPoolData;

        $rootScope.loading = false;

      };

      ///**
      // * all requests complete
      // */
      //var allRequestComplete = function () {
      //
      //  console.log('transfersCtrl - allRequestComplete');
      //  $rootScope.loading = false;
      //  $scope.chooseManager($stateParams.managerId);
      //
      //};

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
            $scope.chooseManager($stateParams.managerId);

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

        $updateDataUtils.updateCoreData(function () {

          $apiFactory.getApiData('playerPoolData')
            .then(loadData);

        });

      };

      init();

    });

})();
