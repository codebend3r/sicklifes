/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('transfersCtrl', function ($scope, $rootScope, $q, $state, $timeout, arrayMappers, apiFactory, objectUtils, updateDataUtils, momentService) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /*
      Round 1, Move 1 - November 9
      Round 1, Move 2 - November 10
      Round 1, Move 3 - November 11
      Round 1, Move 4 - November 12
      Round 1, Move 5 - November 13
      Round 1, Move 6 - November 14

      Round 2, Move 1 - November 16
      Round 2, Move 2 - November 17
      Round 2, Move 3 - November 18
      Round 2, Move 4 - November 19
      Round 2, Move 5 - November 20
      Round 2, Move 6 - November 21

      Round 3, Move 1 - November 23
      Round 3, Move 2 - November 24
      Round 3, Move 3 - November 25
      Round 3, Move 4 - November 26
      Round 3, Move 5 - November 27
      Round 3, Move 6 - November 28

      ////////////

      Round 1, Move 1 - February 8
      Round 1, Move 2 - February 9
      Round 1, Move 3 - February 10
      Round 1, Move 4 - February 11
      Round 1, Move 5 - February 12
      Round 1, Move 6 - February 13

      Round 2, Move 1 - February 15
      Round 2, Move 2 - February 16
      Round 2, Move 3 - February 17
      Round 2, Move 4 - February 18
      Round 2, Move 5 - February 19
      Round 2, Move 6 - February 20

      Round 3, Move 1 - February 22
      Round 3, Move 2 - February 23
      Round 3, Move 3 - February 24
      Round 3, Move 4 - February 25
      Round 3, Move 5 - February 26
      Round 3, Move 6 - February 27
      */

      $rootScope.loading = true;

      $scope.dt = new Date();

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

        var pickNumber = _.keys($scope.selectedManager.players).length + 1;

        if ($scope.draftMode) {

          var draftedPlayer = objectUtils.cleanPlayer(player, $scope.draftMode);
          draftedPlayer.managerName = $scope.selectedManager.managerName;

          $scope.selectedManager.players = $scope.selectedManager.players || {};

          //TODO make sure date doesn't include time

          draftedPlayer.pickNumber = pickNumber;

          console.log('pick #', pickNumber);
          $scope.selectedManager.players[draftedPlayer.id] = draftedPlayer;

          var saveObject = $scope.managersData;
          saveObject._lastSyncedOn = momentService.syncDate();

          $scope.startFireBase(function () {
            $scope.saveToFireBase(saveObject, 'managersData');
          });

        } else {

          var addedPlayer = objectUtils.playerResetGoalPoints(player);

          apiFactory.getPlayerProfile('soccer', addedPlayer.id)
            .then(function (result) {
              return arrayMappers.playerInfo(addedPlayer, result);
            })
            .then(function () {
              $scope.addedPlayerObject = addedPlayer;
              $scope.addedPlayerObject.pickNumber = pickNumber;
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

        $scope.droppedPlayerObject = $scope.getManagersPlayerById(player.id);
        //var pickNumber = _.keys($scope.selectedManager.players).length + 1;
        //$scope.droppedPlayerObject.pickNumber = pickNumber;
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

      $scope.$watch('dt', function(nv, ov) {
        console.log('nv:', nv);
      });

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
          $scope.selectedManager.players[$scope.addedPlayerObject.id] = objectUtils.cleanPlayer($scope.addedPlayerObject);

          // drop
          var droppedPlayer = $scope.selectedManager.players[$scope.droppedPlayerObject.id];
          droppedPlayer.status = 'dropped';
          droppedPlayer.dateOfTransaction = momentService.transactionDate();

          console.log('///////////////////////////////////////////');
          console.log('addedPlayerObject: ', $scope.addedPlayerObject);
          console.log('droppedPlayerObject: ', $scope.droppedPlayerObject);
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

        $scope.managersData = $rootScope.managersData.data;

        $scope.allPlayers = $rootScope.playerPoolData.allPlayers;

        console.log('populate transfer history');

        $scope.transferHistory = [];

        _.each($scope.managersData, function (m) {

          _.each(m.players, function(player) {

            if (player.status !== 'drafted') {

              $scope.transferHistory.push(player);

            }

          });
        });

        $timeout(function() {
          $rootScope.loading = false;
        }, 250);

      };

      /**
       * @name updatePlayerPoolData
       * @description http request all player pool
       */
      $scope.updatePlayerPoolData = function () {

        updateDataUtils.updatePlayerPoolData(function (result) {
          console.log('PLAYER POOL DATA UPDATED');
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
            _lastSyncedOn: momentService.syncDate(),
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

        updateDataUtils.updateCoreData(function () {

          apiFactory.getApiData('playerPoolData')
            .then(loadData);

        });

      };

      init();

    });

})();
