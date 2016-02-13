/**
 * Created by Bouse on 01/07/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $timeout, $moment, arrayFilter, managerPlayers, momentService, transferDates, managersData, updateDataUtils) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      $scope.goalsOnlyFilterOn = true;

      /**
       * @name changeManager
       * @description
       * @param selectedManagerName
       */
      $scope.changeManager = function (selectedManagerName) {
        $rootScope.loading = true;
        $state.go($state.current, {managerId: selectedManagerName.toLowerCase()});
      };

      /**
       * @name tabData
       * @description tabs data
       */
      $scope.tabData = [
        {
          title: 'Overview',
          route: 'managers.overview'
        },
        {
          title: 'Game Logs',
          route: 'managers.gamelogs'
        }
      ];

      ////////////////////////////////////////
      ////////////// private /////////////////
      ////////////////////////////////////////

      /**
       * @name loadData
       * @description callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function () {

        if (angular.isUndefinedOrNull($stateParams.managerId) || _.isEmpty($stateParams.managerId)) return;

        $rootScope.loading = false;

        $scope.selectedManager = managersData.data[$stateParams.managerId];

        $scope.selectedManager.players = managerPlayers.data[$stateParams.managerId].players;

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog
          .filter(function (log) {
            return log.goals;
          });

        $scope.selectedManagerName = $scope.selectedManager.managerName;

        $rootScope.lastSyncDate = $scope.selectedManager._lastSyncedOn;
        $rootScope.source = 'firebase';

        if (angular.isDefined($scope.selectedManager._lastSyncedOn) && momentService.isHoursAgo($scope.selectedManager._lastSyncedOn)) {
          console.log('-- data for', $scope.selectedManager.managerName, 'is old --');
        } else if (momentService.isHoursAgo($scope.managersData._lastSyncedOn)) {
          console.log('-- data is too old --');
        } else {
          console.log('-- data is up to date --');
        }

        $scope.selectedManager.wildCardCount = 0;

        var gameLogsObject = {};
        var chartsObj = {};
        var playersObj = {};
        var index = 0;

        _.each(managersData.data, function (manager, key) {

          manager.id = index++;

          gameLogsObject[key] = {
            filteredMonthlyGoalsLog: manager.filteredMonthlyGoalsLog,
            monthlyGoalsLog: manager.monthlyGoalsLog
          }

          chartsObj[key] = {
            chartData: manager.chartData
          }

          playersObj[key] = {
            players: manager.players
          }

          // angular.isDefined(manager.filteredMonthlyGoalsLog) && delete manager.filteredMonthlyGoalsLog;
          // angular.isDefined(manager.monthlyGoalsLog) && delete manager.monthlyGoalsLog;
          // angular.isDefined(manager.chartData) && delete manager.chartData;
          // angular.isDefined(manager.players) && delete manager.players;

          _.each(manager.player, function(player) {

            angular.isDefined(player.seriGameLog) && delete player.seriGameLog;
            angular.isDefined(player.eplGameLog) && delete player.eplGameLog;
            angular.isDefined(player.ligaGameLog) && delete player.ligaGameLog;
            angular.isDefined(player.chlgGameLog) && delete player.chlgGameLog;
            angular.isDefined(player.euroGameLog) && delete player.euroGameLog;
            angular.isDefined(player.allLeaguesName) && delete player.allLeaguesName;

          });

        });

        _.each($scope.selectedManager.players, function (player) {
          $scope.checkForWildCard(player, $scope.selectedManager);
        });

        // console.log('gameLogsObject', gameLogsObject);
        // console.log('chartsObj', chartsObj);
        // console.log('peoplesObj', peoplesObj);
        console.log('managersData', managersData.data);

        $timeout(function () {

          //$scope.saveRoster();

          // $scope.saveToFireBase({
          //   data: chartsObj,
          //   _lastSyncedOn: momentService.syncDate()
          // }, 'charts');

          // $scope.saveToFireBase({
          //   data: gameLogsObject,
          //   _lastSyncedOn: momentService.syncDate()
          // }, 'gameLogs');

          // $scope.saveToFireBase({
          //   data: playersObj,
          //   _lastSyncedOn: momentService.syncDate()
          // }, 'managerPlayers');

        }, 1500);

      };

      /**
       * @name updateAllManagerData
       * @description update all managers data
       */
      $scope.updateAllManagerData = function () {

        $rootScope.loading = true;

        updateDataUtils.updateAllManagerData(managersData, function (result) {

          $scope.loading = false;
          managersData.data = result;
          $scope.saveRoster();

        });

      };

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        console.log('month change detected:', month.monthName);
        $scope.currentMonthLog = _.chain($scope.selectedManager.filteredMonthlyGoalsLog)
          .flatten(true)
          .filter(arrayFilter.filterOnMonth.bind($scope, month))
          .value();
      });

      loadData();

    });

})();
