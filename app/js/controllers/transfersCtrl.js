/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $state, $timeout, $arrayMappers, $apiFactory, $objectUtils, $modal, $updateDataUtils, $momentService, $localStorage, $stateParams) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      //var managerId = $stateParams.managerId ? $stateParams.managerId : 'chester';

      $rootScope.loading = true;

      $scope.today = function () {
        $scope.dt = new Date();
      };

      $scope.clear = function () {
        $scope.dt = null;
      };

      /**
       * @name allPlayers
       * @type {Array}
       */
      $rootScope.allPlayers = [];

      /**
       * @name updatePlayerPoolData
       * @type {null}
       */
      $scope.updatePlayerPoolData = null;

      /**
       * @name selectedPlayers
       * @type {object}
       */
      $scope.selectedPlayers = null;

      /**
       * @name changeManager
       * {ng-click} - when manager option changes
       */
      $scope.changeManager = function (selectedManager) {
        $state.go($state.current.name, { managerId: selectedManager.managerName.toLowerCase() });
      };

      /**
       * @name getManagersPlayerById
       * @description TODO
       */
      $scope.getManagersPlayerById = function (id) {

        var selectedPlayer = {};

        _.some($rootScope.managersData.data, function (manager) {
          if (manager.players[id]) {
            selectedPlayer = manager.players[id];
            return true;
          }
        });

        return selectedPlayer;

      };

      /**
       * @name addPlayer
       * @description TODO
       */
      $scope.addPlayer = function (player) {

        if ($scope.draftMode) {

          var draftedPlayer = $objectUtils.cleanPlayer(player, $scope.draftMode);
          draftedPlayer.managerName = $scope.selectedManager.managerName;

          $scope.selectedManager.players = $scope.selectedManager.players || {};

          var pickNumber = _.keys($scope.selectedManager.players).length + 1;

          draftedPlayer.pickNumber = pickNumber;

          console.log('pick #', pickNumber);
          $scope.selectedManager.players[draftedPlayer.id] = draftedPlayer;

          var saveObject = $scope.managersData;
          saveObject._lastSyncedOn = $momentService.syncDate();

          $scope.startFireBase(function () {
            $scope.saveToFireBase(saveObject, 'managersData');
          });

        } else {

          var addedPlayer = $objectUtils.playerResetGoalPoints(player);

          $apiFactory.getPlayerProfile('soccer', addedPlayer.id)
            .then(function (result) {
              return $arrayMappers.playerInfo(addedPlayer, result);
            })
            .then(function () {
              $scope.addedPlayerObject = addedPlayer;
              $scope.transactionPlayerAdded = true;
            })

        }

      };

      /**
       * @name dropPlayer
       * @description
       */
      $scope.dropPlayer = function (player) {

        $scope.droppedPlayerObject = $scope.getManagersPlayerById(player.id);
        var pickNumber = _.keys($scope.selectedManager.players).length + 1;
        $scope.droppedPlayerObject.pickNumber = pickNumber;
        $scope.transactionPlayerRemoved = true;

      };

      /**
       * @name playersTableParams
       * @description
       * @type {{addPlayer: (Function|*), dropPlayer: (Function|*), draftMode: boolean}}
       */
      $scope.playersTableParams = {
        addPlayer: $scope.addPlayer,
        dropPlayer: $scope.dropPlayer,
        draftMode: $scope.draftMode
      };

      /**
       * @name addedPlayerImage
       * @description
       * @type {string}
       */
      $scope.addedPlayerImage = '';

      /**
       * @name droppedPlayerImage
       * @description
       * @type {string}
       */
      $scope.droppedPlayerImage = '';

      /**
       * @name transactionPlayerAdded
       * @description whether a player has been added to a roster
       * @type {boolean}
       */
      $scope.transactionPlayerAdded = false;

      /**
       * @name transactionPlayerRemoved
       * @description whether a player has been removed from a roster
       * @type {boolean}
       */
      $scope.transactionPlayerRemoved = false;

      /**
       * @name saveTransaction
       * @description saves the added and dropped players to the current manager's roster
       */
      $scope.saveTransaction = function () {

        if (angular.isDefined($scope.addedPlayerObject) && angular.isDefined($scope.droppedPlayerObject)) {

          $scope.selectedManager.transactions = $scope.selectedManager.transactions || [];

          console.log('# of transactions for manager', _.keys($scope.selectedManager.transactions).length);

          $scope.selectedManager.transactions.push({
            drop: $scope.droppedPlayerObject,
            add: $scope.addedPlayerObject
          });

          $scope.addedPlayerObject.status = 'added';

          // add
          $scope.selectedManager.players[$scope.addedPlayerObject.id] = $objectUtils.cleanPlayer($scope.addedPlayerObject);

          // drop
          var droppedPlayer = $scope.selectedManager.players[$scope.droppedPlayerObject.id];
          droppedPlayer.status = 'dropped';
          droppedPlayer.dateOfTransaction = $momentService.transactionDate();

          console.log('///////////////////////////////////////////');
          console.log('transactions', $scope.selectedManager.transactions);
          console.log('///////////////////////////////////////////');

          $scope.startFireBase(function () {

            $scope.saveRoster();

          });

        } else {

          console.warn('no player to add and/or drop has been specified');

        }

      };

      /**
       * @name loadData
       * @description read data from firebase
       * @param result
       */
      var loadData = function (result) {

        // console.log('///////////////////');
        // console.log('result:', result);
        // console.log('///////////////////');

        $scope.managersData = $rootScope.managersData.data;

        $scope.allPlayers = $rootScope.playerPoolData.allPlayers;

        $rootScope.loading = false;

      };

      /**
       * @name updatePlayerPoolData
       * @description http request all player pool
       */
      $scope.updatePlayerPoolData = function () {

        $updateDataUtils.updatePlayerPoolData(function (result) {

          $scope.allPlayers = result;

        });

      };

      /**
       * @name savePlayerPoolData
       * @description
       */
      $scope.savePlayerPoolData = function () {

        $scope.startFireBase(function () {

          var saveObject = {
            _syncedFrom: 'transfersCtrl',
            _lastSyncedOn: $momentService.syncDate(),
            allPlayers: $scope.allPlayers
          };

          $scope.saveToFireBase(saveObject, 'playerPoolData');

        });

      };

      /**
       * @name init
       * @description init function
       */
      var init = function () {

        $scope.today();

        $updateDataUtils.updateCoreData(function () {

          $apiFactory.getApiData('playerPoolData')
            .then(loadData);

        });

      };

      init();

    });

})();
