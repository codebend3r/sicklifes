/**
 * Created by Bouse on 02/16/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .filter('capitalize', function () {
      return function (input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
    })

    .controller('managersCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $timeout, $moment, arrayFilter, momentService, transferDates, managerData, managerPlayers, gameLogs, updateDataUtils, apiFactory) {

      ////////////////////////////////////////
      /////////////// public /////////////////
      ////////////////////////////////////////

      /**
       * @name goalsOnlyFilterOn
       * @description TODO
       */
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

      $scope.managersList = ['chester', 'frank', 'joe', 'justin', 'mike', 'dan'];

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

        $scope.selectedManager = managerData.data[$stateParams.managerId];
        $scope.selectedManager.players = managerPlayers.data[$stateParams.managerId].players;
        $scope.selectedManager.filteredMonthlyGoalsLog = gameLogs.data[$stateParams.managerId].filteredMonthlyGoalsLog;
        $scope.selectedManager.monthlyGoalsLog = gameLogs.data[$stateParams.managerId].monthlyGoalsLog;

        $scope.currentMonthLog = $scope.selectedManager.filteredMonthlyGoalsLog
          .filter(function (log) {
            return log.goals;
          });

        $scope.selectedManagerName = $scope.selectedManager.managerName;

        $rootScope.lastSyncDate = $scope.selectedManager._lastSyncedOn;
        $rootScope.source = 'firebase';

        if (angular.isDefined($scope.selectedManager._lastSyncedOn) && momentService.isHoursAgo($scope.selectedManager._lastSyncedOn)) {
          console.log('-- data for', $scope.selectedManager.managerName, 'is old --');
        } else if (momentService.isHoursAgo($scope.managerData._lastSyncedOn)) {
          console.log('-- data is too old --');
        } else {
          console.log('-- data is up to date --');
        }

        $scope.selectedManager.wildCardCount = 0;

        _.each($scope.selectedManager.players, function (player) {
          $scope.checkForWildCard(player, $scope.selectedManager);
        });

      };

      $scope.recoverFromManagerPlayers = function () {

        var managerCore = {};

        _.each(managerPlayers.data, function(m, key) {

          managerCore[key] = {
            managerName: key,
            players: {}
          };

          _.each(m.players, function(p) {

            if (angular.isUndefinedOrNull(managerCore[key])) {
              managerCore[key] = {
                players: {}
              };
            }

            managerCore[key].players[p.id] = {
              player: {
                id: p.id,
                name: p.playerName,
                status: p.status,
                image: p.image
              },
              team: {
                name: p.teamName,
                logo: p.teamLogo,
                id: p.teamId
              },
              league: {
                name: p.leagueName,
                slugs: p.leagueSlugs
              },
              manager: {
                name: key.capitalize()
              },
              //stats: {},
              // active: !angular.isUndefinedOrNull(p.active) ? p.active === false : false,
              active: true,
              dateOfTransaction: p.dateOfTransaction
            };

          });

        });

        console.log('managerCore', managerCore);

        $scope.saveCoreData(managerCore);

      };

      $scope.recoverFromCore = function () {

        $scope.showSpinner();

        updateDataUtils.recoverFromManagerCore()
          .then(function (result) {
            return updateDataUtils.updateAllManagerData(result.data);
          })
          .then(function (result) {

            console.log('////////////////////////////');
            console.log('MANAGER DATA RECOVERED', result);
            console.log('////////////////////////////');

            var mappedManagers = {};

            _.each(result, function (obj) {
              mappedManagers[obj.managerName.toLowerCase()] = obj;
            });

            $scope.selectedManager = mappedManagers[$stateParams.managerId];

            $scope.saveRoster(mappedManagers);

          });

      };

      /**
       * @name updateAllManagerData
       * @description update all managers data
       */
      $scope.updateAllManagerData = function () {

        $scope.showSpinner();

        apiFactory.getApiData('leagueTables').then(function () {
          updateDataUtils.updateAllManagerData(managerPlayers.data)
            .then(function (result) {

              console.log('////////////////////////////');
              console.log('MANAGER DATA UPDATED');
              console.log('////////////////////////////');

              var mappedManagers = {};

              _.each(result, function (obj) {
                mappedManagers[obj.managerName.toLowerCase()] = obj;
              });

              //managerData.data = result;

              $scope.selectedManager = mappedManagers[$stateParams.managerId];
              $scope.saveRoster(mappedManagers);

            });
        });

      };

      /**
       * @name saveCurrentRoster
       * @description TODO
       */
      $scope.saveCurrentRoster = function () {

        console.log(managerData.data);
        //$scope.saveRoster(managerData.data);

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
