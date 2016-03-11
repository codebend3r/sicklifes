/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('dot', function() {

      return  {
        restrict: 'E',
        replace: true,
        scope: {
          className: '@'
        },
        template: '<svg class="dot-container" height="10" width="10">' +
        '<circle class="dot" ng-class="className" cx="5" cy="5" r="5"/>' +
        'Sorry, your browser does not support inline SVG.' +
        '</svg>'
      }

    })

    .controller('playersDetailsCtrl', function ($scope, $rootScope, $http, $timeout, apiFactory, $location, $stateParams, arrayMappers, chartSettings, textManipulator, objectUtils, transferDates, managersService, updateDataUtils, momentService, managerData, managerPlayers, charts, gameLogs, allPlayersIndex) {

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
      var loadData = function () {

        var findObject = managersService.findPlayerInManagers($stateParams.playerId);

        if (!angular.isUndefinedOrNull(findObject.player) && !angular.isUndefinedOrNull(findObject.manager)) {

          console.log('player found in manager data');

          $scope.player = findObject.player;
          $scope.matchingManager = findObject.manager;

          var managerName = $scope.matchingManager.managerName.toLowerCase();

          $scope.matchingManager.charts = charts.data[managerName].chartData;
          $scope.matchingManager.filteredMonthlyGoalsLog = gameLogs.data[managerName].filteredMonthlyGoalsLog;
          $scope.matchingManager.monthlyGoalsLog = gameLogs.data[managerName].monthlyGoalsLog;

          if (!angular.isUndefinedOrNull($scope.player._lastSyncedOn) && !momentService.isPastYesterday($scope.player._lastSyncedOn)) {

            console.log('player data up to date');
            $scope.changeRange($scope.selectedRange);

          } else {

            console.log('player data NOT up to date');
            $scope.requestUpdateOnPlayer();

          }

        } else if (!angular.isUndefinedOrNull(allPlayersIndex.data[$stateParams.playerId])) {

          console.log('player found in player index');

          $scope.player = allPlayersIndex.data[$stateParams.playerId];

          // check the data of the source data
          if (!angular.isUndefinedOrNull($scope.player._lastSyncedOn) && !momentService.isPastYesterday($scope.player._lastSyncedOn)) {

            console.log('player data up to date');
            $scope.changeRange($scope.selectedRange);

          } else {

            console.log('player data NOT up to date');
            $scope.requestUpdateOnPlayer();

          }

        } else {

          console.log('player not in player index and not in any manager');
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
          var b = moment(new Date(transferDates.leagueStart.date));
          var difference = a.diff(b, 'days');
          console.log(difference, 'day in fantasy league player');
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
      $scope.requestUpdateOnPlayer = function () {

        if (angular.isUndefinedOrNull($stateParams.playerId)) {
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
          .then(function (result) {

            $scope.player = result;
            $scope.player._lastSyncedOn = momentService.syncDate();

            $scope.changeRange($scope.selectedRange);

            $rootScope.loading = false;

            if (momentService.isHoursAgo($scope.player._lastSyncedOn)) {
              $scope.saveToPlayerIndex($scope.player.id , $scope.player);
            } else {
              console.log('wait 24 hours to update this player');
            }


          });

      };

      loadData();

    });

})();
