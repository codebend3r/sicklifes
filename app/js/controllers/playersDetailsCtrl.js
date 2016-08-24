/**
 * Created by Bouse on 09/01/2015
 */

(function() {

  'use strict';

  angular.module('sicklifes')

  .controller('playersDetailsCtrl', function($scope, $rootScope, $log, $http, $timeout, $moment, apiFactory, $location, $stateParams, arrayMappers, chartSettings, textManipulator, objectUtils, transferDates, managersService, updateDataUtils, momentService, managerData, managerPlayers, charts, gameLogs, allPlayersIndex) {

    var lastDays = $scope.lastDays($scope.selectedRange);

    var self = this;

    var data = [];

    var chartMapKeys = ['shots', 'shotsOnGoal', 'goals'];

    ////////////////////////////////////////
    /////////////// public /////////////////
    ////////////////////////////////////////

    $rootScope.loading = true;

    /**
     * @description league images
     */
    $scope.leagueImages = textManipulator.leagueImages;

    ////////////////////////////////////////
    ////////////// private /////////////////
    ////////////////////////////////////////

    /**
     * @name loadData
     * @description find more data on a player by id in the route
     */
    var loadData = function() {

      var findObject = managersService.findPlayerInManagers($stateParams.playerId);

      if (_.isDefined(findObject.player) && _.isDefined(findObject.manager)) {

        $log.debug('player found in manager data');

        $scope.player = findObject.player;
        $scope.matchingManager = findObject.manager;

        var managerName = $scope.matchingManager.managerName.toLowerCase();

        $scope.matchingManager.charts = charts.data[managerName].chartData;
        $scope.matchingManager.filteredMonthlyGoalsLog = gameLogs.data[managerName].filteredMonthlyGoalsLog;
        $scope.matchingManager.monthlyGoalsLog = gameLogs.data[managerName].monthlyGoalsLog;

        if (_.isDefined($scope.player._lastSyncedOn) && !momentService.isPastYesterday($scope.player._lastSyncedOn)) {

          $log.debug('player data up to date');
          $scope.changeRange($scope.selectedRange);

        } else {

          $log.debug('player data NOT up to date');
          $scope.requestUpdateOnPlayer();

        }

      } else if (_.isDefined(allPlayersIndex.data[$stateParams.playerId])) {

        $log.debug('player found in player index');

        $scope.player = allPlayersIndex.data[$stateParams.playerId];

        // check the data of the source data
        if (_.isDefined($scope.player._lastSyncedOn) && !momentService.isPastYesterday($scope.player._lastSyncedOn)) {

          $log.debug('player data up to date');
          $scope.changeRange($scope.selectedRange);

        } else {

          $log.debug('player data NOT up to date');
          $scope.requestUpdateOnPlayer();

        }

      } else {

        $log.debug('player not in player index and not in any manager');
        $scope.player = {};
        $scope.requestUpdateOnPlayer();

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
    $scope.selectedRange = $scope.ranges[4];

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
    $scope.changeChartType = function(selectedType) {

      $scope.selectedType = selectedType;
      $scope.changeRange($scope.selectedRange);

    };

    /**
     * @name logLoop
     * @description loop function for mapping chart data
     * @param calendarDay
     * @param targetObject
     * @param log
     */
    var logLoop = function(calendarDay, targetObject, log) {
      _.each(targetObject, function(obj, mapKey) {
        if (log.datePlayed === calendarDay) {
          if (angular.isDefined(targetObject[mapKey][calendarDay])) {
            targetObject[mapKey][calendarDay] += log[mapKey];
          } else {
            targetObject[mapKey][calendarDay] = log[mapKey];
          }
        } else if (!_.isDefined(targetObject[mapKey][calendarDay])) {
          targetObject[mapKey][calendarDay] = 0;
        }
      });
    };

    /**
     * @name changeRange
     * @description
     */
    $scope.changeRange = function(selectedRange) {

      data = [];

      $scope.selectedRange = selectedRange;

      if ($scope.selectedRange.days === -1) {
        var a = $moment();
        var b = $moment(new Date(transferDates.leagueStart.date));
        var difference = a.diff(b, 'days');
        $log.debug(difference, 'day in fantasy league player');
        lastDays = $scope.lastDays(difference);
      } else {
        lastDays = $scope.lastDays($scope.selectedRange.days);
      }

      var targetArray = data;

      var targetObject = {};
      _.each(chartMapKeys, function(key) {
        targetObject[key] = {};
      });

      _.each(lastDays, function(calendarDay) {

        if ($scope.player.activeLeagues.playedInEPLGames) {
          $scope.player.gameLogs.eplCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
        }

        if ($scope.player.activeLeagues.playedInSeriGames) {
          $scope.player.gameLogs.seriCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
        }

        if ($scope.player.activeLeagues.playedInLigaGames) {
          $scope.player.gameLogs.ligaCompleteLog.forEach(logLoop.bind(self, calendarDay, targetObject));
        }

        if ($scope.player.activeLeagues.playedInChlgGames) {
          $scope.player.gameLogs.chlgCompleteLogs.forEach(logLoop.bind(self, calendarDay, targetObject));
        }

        if ($scope.player.activeLeagues.playedInEuroGames) {
          $scope.player.gameLogs.euroCompleteLogs.forEach(logLoop.bind(self, calendarDay, targetObject));
        }

      });

      var incValue = 0;

      _.each(targetObject, function(value, key) {
        incValue = 0;
        targetArray.push({
          name: key,
          className: key,
          data: _.map(value, function(stat) {
            if ($scope.selectedType.toLowerCase() === 'cumulative') {
              incValue += stat;
              return incValue;
            } else {
              return stat;
            }
          })
        });
      });

      $timeout(function() {
        $('.ct-chart').empty();
        new Chartist.Line('.ct-chart', {
          labels: lastDays,
          series: data
        }, chartSettings.profileChartOptions, chartSettings.responsiveOptions);
      }, 500);

    };

    /**
     * @name requestUpdateOnPlayer
     * @description makes a new http request from thescore api
     */
    $scope.requestUpdateOnPlayer = function() {

      if (!_.isDefined($stateParams.playerId)) {
        throw new Error('$stateParams.playerId was not defined, don\'t do that');
      }

      $scope.player = objectUtils.playerResetGoalPoints($scope.player);
      $scope.player.id = $stateParams.playerId;

      apiFactory.getPlayerProfile('soccer', $stateParams.playerId)
        .then(arrayMappers.playerInfo.bind(this, $scope.player))
        .then(arrayMappers.playerMapPersonalInfo.bind(this, $scope.player))
        .then(arrayMappers.playerGamesLog.bind(this, {
          player: $scope.player,
          manager: $scope.matchingManager
        }))
        .then(function(result) {

          $scope.player = result;
          $scope.player._lastSyncedOn = momentService.syncDate();

          $scope.changeRange($scope.selectedRange);

          $rootScope.loading = false;

          if (momentService.isHoursAgo($scope.player._lastSyncedOn)) {
            $scope.saveToPlayerIndex($scope.player.id, $scope.player);
          } else {
            $log.debug('wait 24 hours to update this player');
          }

        });

    };

    loadData();

  });

})();
