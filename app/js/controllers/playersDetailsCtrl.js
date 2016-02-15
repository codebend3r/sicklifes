/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, apiFactory, $location, $stateParams, arrayMappers, chartSettings, textManipulator, objectUtils, transferDates, managersService, updateDataUtils, momentService, managerData, managerPlayers, charts, gameLogs) {

      console.log('managerData:', managerData);

      var lastDays = $scope.lastDays($scope.selectedRange);

      var self = this;

      var data = [];

      var dataObj = {};

      var chartMapKeys = ['shots', 'shotsOnGoal', 'goals'];

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
       * @description defines $scope.managerData - call when firebase data has loaded
       * @param result
       */
      var loadData = function () {

        $scope.managerData = managerData.data;

        _.each($scope.managerData, function(manager, key) {

          manager.players = managerPlayers.data[key].players;
          manager.chartData = charts.data[key].chartData;
          manager.filteredMonthlyGoalsLog = gameLogs.data[key].filteredMonthlyGoalsLog;
          manager.monthlyGoalsLog = gameLogs.data[key].monthlyGoalsLog;

        });

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

          _.some($scope.managerData, function (manager) {

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

      /**
       * @name ranges
       * @description
       */
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

      /**
       * @name selectedRange
       * @description
       */
      $scope.selectedRange = $scope.ranges[0];

      /**
       * @name types
       * @description
       */
      $scope.types = ['Cumulative', 'Relative'];

      /**
       * @name selectedType
       * @description
       */
      $scope.selectedType = $scope.types[0];

      /**
       * @name changeChartType
       * @description
       */
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
        dataObj = {};

        $scope.selectedRange = selectedRange;

        if ($scope.selectedRange.days === -1) {
          var a = moment();
          var b = moment(transferDates.leagueStart.days);
          var difference = a.diff(b, 'days');
          lastDays = $scope.lastDays(difference);
        } else {
          lastDays = $scope.lastDays($scope.selectedRange.days);
        }

        var targetArray = data;

        var targetObject = {};
        _.each(chartMapKeys, function (key) {
          targetObject[key] = {};
        });

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

          if ($scope.player.playedInChlgGames) {
            $scope.player.gameLogs.chlgCompleteLogs.forEach(logLoop.bind(self, calendarDay, targetObject));
          }

          if ($scope.player.playedInEuroGames) {
            $scope.player.gameLogs.euroCompleteLogs.forEach(logLoop.bind(self, calendarDay, targetObject));
          }

        });

        var incValue = 0;

        _.each(targetObject, function (value, key) {
          incValue = 0;
          targetArray.push({
            name: key,
            className: key,
            data: _.map(value, function (stat) {
              if ($scope.selectedType.toLowerCase() === 'cumulative') {
                incValue += stat;
                return incValue;
              } else {
                return stat;
              }
            })
          });
        });

        $timeout(function () {
          $('.ct-chart').empty();
          new Chartist.Line('.ct-chart', {
            labels: lastDays,
            series: data
          }, chartSettings.profileChartOptions, chartSettings.responsiveOptions);
        }, 500);

      };

      /**
       * @name logLoop
       * @description loop function for mapping chart data
       * @param calendarDay
       * @param targetObject
       * @param log
       */
      var logLoop = function (calendarDay, targetObject, log) {
        _.each(targetObject, function (obj, mapKey) {
          if (log.datePlayed === calendarDay) {
            if (angular.isDefined(targetObject[mapKey][calendarDay])) {
              targetObject[mapKey][calendarDay] += log[mapKey];
            } else {
              targetObject[mapKey][calendarDay] = log[mapKey];
            }
          } else {
            if (angular.isUndefinedOrNull(targetObject[mapKey][calendarDay])) {
              targetObject[mapKey][calendarDay] = 0;
            }
          }
        });
      };

      /**
       * @name requestUpdateOnPlayer
       * @description makes a new http request from thescore api
       */
      var requestUpdateOnPlayer = function () {

        if (angular.isUndefinedOrNull($stateParams.playerId)) {
          throw new Error('$stateParams.playerId was not defined, don\'t do that');
        }

        $scope.player = objectUtils.playerResetGoalPoints($scope.player);
        $scope.player.id = $stateParams.playerId;
        $scope.matchingManager = managersService.findPlayerInManagers($stateParams.playerId).manager;

        console.log('manager name', $scope.matchingManager.managerName);
        console.log('player name', $scope.player.playerName);

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

      loadData();

    });

})();
