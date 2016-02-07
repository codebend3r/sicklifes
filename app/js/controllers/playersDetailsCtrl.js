/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, apiFactory, $location, $stateParams, arrayMappers, chartSettings, textManipulator, objectUtils, transferDates, managersService, updateDataUtils, momentService, managersData) {

      console.log('managersData:', managersData);

      var lastDays = $scope.lastDays($scope.selectedRange);

      var self = this;

      var data = [];

      var dataObj = {};

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $rootScope.loading = true;

      /**
       * @description player
       */
      $scope.player = {};

      /**
       * @description league images
       */
      $scope.leagueImages = textManipulator.leagueImages;

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @name loadData
       * @description defines $scope.managersData - call when firebase data has loaded
       * @param result
       */
      var loadData = function () {

        $scope.managersData = $rootScope.managersData.data;

        if (angular.isDefined($rootScope.allPlayersIndex)) {
          console.log('player found in allPlayers index');
          $scope.allPlayers = $rootScope.allPlayersIndex;
        }

        //////////////////

        findPlayerByID();

      };

      /**
       * @name findPlayerByID
       * @description find more data on a player by id in the route
       */
      var findPlayerByID = function () {

        var foundPlayer = false;

        // check source
        if (angular.isDefined($scope.allPlayers) && angular.isDefined($scope.allPlayers.data) && angular.isDefined($scope.allPlayers.data[$stateParams.playerId]) && !Array.isArray($scope.allPlayers)) {

          $scope.player = $scope.allPlayers.data[$stateParams.playerId];
          foundPlayer = true;

        } else {

          _.some($scope.managersData, function (manager) {

            if (angular.isDefined(manager.players[$stateParams.playerId])) {
              $scope.player = manager.players[$stateParams.playerId];
              foundPlayer = true;
              return true;
            }

          });

        }

        // check the data of the source data
        if (foundPlayer && angular.isDefined($scope.player._lastSyncedOn) && !momentService.isPastYesterday($scope.player._lastSyncedOn)) {

          console.log('foundPlayer and is up to date', $scope.player.playerName);
          requestUpdateOnPlayer();

        } else {

          console.log('not found player and/or is out of date');
          requestUpdateOnPlayer();

        }

      };

      $scope.ranges = [
        {
          days: 30,
          label: 'Last 30 Days'
        },
        {
          days: 60,
          label: 'Last 60 Days'
        },
        {
          days: 90,
          label: 'Last 90 Days'
        },
        {
          days: 120,
          label: 'Last 120 Days'
        },
        {
          days: -1,
          label: 'Entire Season'
        }
      ];

      $scope.selectedRange = $scope.ranges[4];

      $scope.types = ['cumulative', 'relative'];

      $scope.selectedType = $scope.types[0];

      $scope.changeChartType = function (selectedType) {

        $scope.selectedType = selectedType;
        $scope.changeRange($scope.selectedRange);

      };

      /**
       * @name changeRange
       * @description
       */
      $scope.changeRange = function (selectedRange) {

        data = [];
        data.push([]);

        dataObj = {};

        $scope.selectedRange = selectedRange;

        if ($scope.selectedRange.days === -1) {
          var a = moment();
          //var b = moment(transferDates.leagueStart.days);
          var b = moment('2015/08/01');
          var difference = a.diff(b, 'days');
          lastDays = $scope.lastDays(difference);
        } else {
          lastDays = $scope.lastDays($scope.selectedRange.days);
        }

        var targetObject = dataObj;
        var targetArray = data[0];

        _.each(lastDays, function (calendarDay) {

          if ($scope.player.playedInEPLGames) {
            $scope.player.gameLogs.eplCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
          }

          if ($scope.player.playedInSeriGames) {
            $scope.player.gameLogs.seriCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
          }

          if ($scope.player.playedInLigaGames) {
            $scope.player.gameLogs.ligaCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
          }

        });

        var incValue = 0;

        console.log('$scope.selectedType', $scope.selectedType);

        _.each(targetObject, function (value) {
          if ($scope.selectedType === 'cumulative') {
            incValue += value;
            targetArray.push(incValue);
          } else {
            targetArray.push(value);
          }
        });

        $timeout(function () {
          $('.ct-chart').empty();
          new Chartist.Line('.ct-chart', {
            labels: lastDays,
            series: data
          }, chartSettings.profileChartOptions);
        }, 1000);

      };

      /**
       * @name logLoop
       * @description
       */
      var logLoop = function (calendarDay, targetObject, log) {
        if (log.datePlayed === calendarDay) {
          if (angular.isDefined(targetObject[calendarDay])) {
            targetObject[calendarDay] += log.goals;
          } else {
            targetObject[calendarDay] = log.goals;
          }
        } else {
          if (angular.isUndefinedOrNull(targetObject[calendarDay])) {
            targetObject[calendarDay] = 0;
          }
        }
      };

      /**
       * @name requestUpdateOnPlayer
       * @description
       */
      var requestUpdateOnPlayer = function () {

        if (angular.isUndefinedOrNull($stateParams.playerId)) {
          throw new Error('$stateParams.playerId was not defined, don\'t do that');
        }

        $scope.player = objectUtils.playerResetGoalPoints($scope.player);
        $scope.player.id = $stateParams.playerId;
        $scope.matchingManager = managersService.findPlayerInManagers($stateParams.playerId).manager;

        apiFactory.getPlayerProfile('soccer', $stateParams.playerId)
          .then(arrayMappers.playerInfo.bind(this, $scope.player))
          .then(arrayMappers.playerMapPersonalInfo.bind(this, $scope.player))
          .then(arrayMappers.playerGamesLog.bind(this, {
            player: $scope.player,
            manager: $scope.matchingManager
          }))
          .then(function (result) {

            $scope.player = result;
            $scope.player._lastSyncedOn = momentService.syncDate();

            $scope.changeRange($scope.selectedRange);

            console.log('player', $scope.player);

            $rootScope.loading = false;

            //$scope.saveToPlayerIndex($scope.player.id , $scope.player);

          });

      };

      loadData()

    });

})();
