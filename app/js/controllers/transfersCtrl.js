/**
 * Created by Bouse on 02/16/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $state, $timeout, $stateParams, arrayMappers, transferDates, apiFactory, objectUtils, updateDataUtils, momentService, managersService, managerData, managerPlayers, playerPoolData) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

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

          $log.debug('pick #', pickNumber);
          $scope.selectedManager.players[draftedPlayer.id] = draftedPlayer;

          var saveObject = $scope.managerData;
          saveObject._lastSyncedOn = momentService.syncDate();

          $scope.saveToFireBase({
            _lastSyncedOn: momentService.syncDate(),
            data: $scope.managerData
          }, 'managerData');

        } else {

          var addedPlayer = objectUtils.playerResetGoalPoints(player);

          $log.debug('addedPlayer', addedPlayer);

          apiFactory.getPlayerProfile('soccer', addedPlayer.player.id)
            .then(function (result) {
              return arrayMappers.playerInfo(addedPlayer, result);
            })
            .then(function () {
              $scope.addedPlayerObject = addedPlayer;
              $scope.addedPlayerObject.player.pickNumber = pickNumber;
              $scope.addedPlayerObject.dateOfTransaction = $scope.currentRound.date;
              $scope.transactionPlayerAdded = true;
            });

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

          $log.debug('# of transactions for manager', _.keys($scope.selectedManager.transactions).length);

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

          $log.debug('///////////////////////////////////////////');
          $log.debug('addedPlayerObject: ', $scope.addedPlayerObject);
          $log.debug('droppedPlayerObject: ', $scope.droppedPlayerObject);
          $log.debug('///////////////////////////////////////////');

          $scope.saveRoster(managerData.data);

        } else {

          $log.warn('no player to add and/or drop has been specified');

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

        updateDataUtils.updatePlayerPoolData().then(function (result) {

          $log.debug('PLAYER POOL DATA UPDATED');
          $scope.allPlayers = result;

          // $scope.saveToFireBase({
          //   _lastSyncedOn: momentService.syncDate(),
          //   allPlayers: result
          // }, 'playerPoolData');
        });

      };

      /**
       * @name loadData
       * @description read data from firebase
       * @param result
       */
      var loadData = function () {

        if (!_.isDefined($stateParams.managerId) || _.isEmpty($stateParams.managerId)) return;

        // _.each(managerData.data, function(manager, key) {
        //   !_.isDefined(manager.players) && (manager.players = managerPlayers.data[key].players);
        // });

        $scope.managerData = managerData.data;
        $scope.selectedManager = managerData.data[$stateParams.managerId];

        $scope.selectedManagerName = $scope.selectedManager.managerName;
        $scope.allPlayers = playerPoolData.allPlayers;
        $scope.transferHistory = [];

        _.each($scope.managerData, function (m) {
          _.each(m.players, function (p) {
            if (p.player.status !== 'drafted') {
              $log.debug('p:', p);
              $scope.transferHistory.push(p);
            }
          });
        });

        _.some(transferDates.transfers, function (round) {
          return !round.roundCompleted && ($scope.currentRound = round);
        });

      };

      loadData();

    });

})();
