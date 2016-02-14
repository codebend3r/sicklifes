/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $state, $timeout, $stateParams, arrayMappers, transferDates, apiFactory, objectUtils, updateDataUtils, momentService, managersService, managerData) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

      /**
       * @name tabData
       * @description tabs data
       */
      $scope.tabData = [
        {
          title: 'History',
          route: 'transfers.history'
        },
        {
          title: 'Free Agency',
          route: 'transfers.freeagency'
        }
      ];

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
        $state.go($state.current.name, {managerId: selectedManager.managerName.toLowerCase()});
      };

      ///**
      // * @name getManagersPlayerById
      // * @description TODO
      // */
      //$scope.getManagersPlayerById = function (id) {
      //
      //  var selectedPlayer = {};
      //
      //  _.some($rootScope.managerData.data, function (manager) {
      //    if (manager.players[id]) {
      //      selectedPlayer = manager.players[id];
      //      return true;
      //    }
      //  });
      //
      //  return selectedPlayer;
      //
      //};

      /**
       * @name addPlayer
       * @description TODO
       */
      $scope.addPlayer = function (player) {

        var pickNumber = _.keys($scope.selectedManager.players).length + 1;

        if ($scope.draftMode) {

          var draftedPlayer = objectUtils.cleanPlayer(player, $scope.draftMode);
          draftedPlayer.managerName = $scope.selectedManager.managerName;

          $scope.selectedManager.players = $scope.selectedManager.players || {};

          //TODO make sure date doesn't include time

          draftedPlayer.pickNumber = pickNumber;

          console.log('pick #', pickNumber);
          $scope.selectedManager.players[draftedPlayer.id] = draftedPlayer;

          var saveObject = $scope.managerData;
          saveObject._lastSyncedOn = momentService.syncDate();

          $scope.saveToFireBase(saveObject, 'managerData');

        } else {

          var addedPlayer = objectUtils.playerResetGoalPoints(player);

          apiFactory.getPlayerProfile('soccer', addedPlayer.id)
            .then(function (result) {
              return arrayMappers.playerInfo(addedPlayer, result);
            })
            .then(function () {
              $scope.addedPlayerObject = addedPlayer;
              $scope.addedPlayerObject.pickNumber = $scope.currentRound.pick;
              $scope.addedPlayerObject.dateOfTransaction = $scope.currentRound.date;
              console.log('pickNumber', pickNumber);
              $scope.transactionPlayerAdded = true;
            })

        }

      };

      /**
       * @name dropPlayer
       * @description
       */
      $scope.dropPlayer = function (player) {

        $scope.droppedPlayerObject = managersService.findPlayerInManagers(player.id).player;
        $scope.droppedPlayerObject.dateOfTransaction = $scope.currentRound.date;
        //var pickNumber = _.keys($scope.selectedManager.players).length + 1;
        //$scope.droppedPlayerObject.pickNumber = pickNumber;
        $scope.transactionPlayerRemoved = true;

      };

      /**
       * @name saveTransaction
       * @description saves the added and dropped players to the current manager's roster
       */
      $scope.saveTransaction = function () {

        if (angular.isDefined($scope.addedPlayerObject) && angular.isDefined($scope.droppedPlayerObject)) {

          $scope.selectedManager.transactions = $scope.selectedManager.transactions || [];

          console.log('# of transactions for manager', _.keys($scope.selectedManager.transactions).length);

          $scope.addedPlayerObject.status = 'added';

          // add
          $scope.selectedManager.players[$scope.addedPlayerObject.id] = objectUtils.cleanPlayer($scope.addedPlayerObject);

          // drop
          var droppedPlayer = $scope.selectedManager.players[$scope.droppedPlayerObject.id];
          droppedPlayer.status = 'dropped';
          droppedPlayer.dateOfTransaction = $scope.currentRound.date;

          $scope.selectedManager.transactions.push({
            drop: $scope.droppedPlayerObject,
            add: $scope.addedPlayerObject
          });

          console.log('///////////////////////////////////////////');
          console.log('addedPlayerObject: ', $scope.addedPlayerObject);
          console.log('droppedPlayerObject: ', $scope.droppedPlayerObject);
          console.log('///////////////////////////////////////////');

          $scope.saveRoster();

        } else {

          console.warn('no player to add and/or drop has been specified');

        }

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
       * @name updatePlayerPoolData
       * @description http request all player pool
       */
      $scope.updatePlayerPoolData = function () {

        $rootScope.loading = true;

        updateDataUtils.updatePlayerPoolData(function (result) {
          console.log('PLAYER POOL DATA UPDATED');
          $scope.allPlayers = result;
          $rootScope.loading = false;
          $scope.savePlayerPoolData();
        });

      };

      /**
       * @name savePlayerPoolData
       * @description
       */
      $scope.savePlayerPoolData = function () {

        var saveObject = {
          _syncedFrom: 'transfersCtrl',
          _lastSyncedOn: momentService.syncDate(),
          allPlayers: $scope.allPlayers
        };

        $scope.saveToFireBase(saveObject, 'playerPoolData');

      };

      /**
       * @name loadData
       * @description read data from firebase
       * @param result
       */
      var loadData = function () {

        if (angular.isUndefinedOrNull($stateParams.managerId) || _.isEmpty($stateParams.managerId)) return;

        $scope.managerData = managerData.data;

        $scope.selectedManager = managerData.data[$stateParams.managerId];

        $scope.selectedManagerName = $scope.selectedManager.managerName;

        $scope.allPlayers = $rootScope.playerPoolData.allPlayers;

        console.log('populate transfer history - START');

        $scope.transferHistory = [];

        _.each($scope.managerData, function (m) {
          _.each(m.players, function (player) {
            if (player.status !== 'drafted') {
              $scope.transferHistory.push(player);
            }
          });
        });

        console.log('populate transfer history - END');

        _.some(transferDates.transfers, function (round) {
          return !round.roundCompleted && ($scope.currentRound = round);
        });

      };

      loadData();

    });

})();
