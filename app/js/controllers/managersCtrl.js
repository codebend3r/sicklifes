/**
 * Created by Bouse on 02/16/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .controller('managersCtrl', function ($scope, $rootScope, $log, $state, $stateParams, $window, $timeout, $moment, arrayFilter, momentService, transferDates, managerData, managerPlayers, gameLogs, updateDataUtils, arrayMappers, objectUtils, apiFactory, dataRecovery) {

      // public

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
        $state.go($state.current, { managerId: selectedManagerName.toLowerCase() });
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

      // private

      /**
       * @name loadData
       * @description callback for when firebase is loaded
       * @param result {object} - response
       */
      var loadData = function () {

        if (!_.isDefined($stateParams.managerId) || _.isEmpty($stateParams.managerId)) return;

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
          $log.debug('-- data for', $scope.selectedManager.managerName, 'is old --');
        } else if (momentService.isHoursAgo($scope.managerData._lastSyncedOn)) {
          $log.debug('-- data is too old --');
        } else {
          $log.debug('-- data is up to date --');
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

            if (!_.isDefined(managerCore[key])) {
              managerCore[key] = {
                players: {}
              };
            }

            managerCore[key].players[p.id] = {
              player: {
                id: p.id,
                name: p.playerName,
                status: p.status,
                image: p.playerImage
              },
              team: {
                id: p.teamId,
                name: p.teamName,
                logo: p.teamLogo
              },
              league: {
                name: p.leagueName,
                slugs: p.leagueSlugs
              },
              manager: {
                name: key.capitalize()
              },
              // stats: {},
              // active: !!_.isDefined(p.active) ? p.active === false : false,
              active: true,
              dateOfTransaction: p.dateOfTransaction
            };

            // if (!_.isDefined(managerCore[key].players[p.id].league)) {
            //   $log.debug(p.playerName, managerCore[key].players[p.id].league);
            // }

            $log.debug(p.playerName, managerCore[key].players[p.id].league.name);

            var currentPlayers = dataRecovery.draftOrder[key];

            _.each(currentPlayers, function(element, index) {

              if (_.isDefined(p.playerName)) {
                if (p.playerName.toLowerCase() === element.toLowerCase()) {
                  managerCore[key].players[p.id].player.pickNumber = index + 1;
                }
              }

            });

          });

        });

        $log.debug('managerCore', managerCore);

        $scope.saveCoreData(managerCore);

      };

      $scope.recoverFromCore = function () {

        $scope.showSpinner();

        updateDataUtils.recoverFromManagerCore()
          .then(function (result) {
            return updateDataUtils.updateAllManagerData(result.data);
          })
          .then(function (result) {

            $log.debug('////////////////////////////');
            $log.debug('MANAGER DATA RECOVERED');
            $log.debug('////////////////////////////');

            var mappedManagers = _.object(_.map(result, function(obj) {
              return [obj.managerName.toLowerCase(), obj];
            }));

            $scope.selectedManager = mappedManagers[$stateParams.managerId];

            $scope.saveRoster(mappedManagers);

          });

      };

      $scope.updatePlayer = function(player) {

        apiFactory.getApiData('leagueTables').then(function () {

          var updatingPlayer = objectUtils.playerResetGoalPoints(player);

          apiFactory.getPlayerProfile('soccer', updatingPlayer.player.id)
            .then(arrayMappers.playerInfo.bind(this, updatingPlayer))
            .then(arrayMappers.playerMapPersonalInfo.bind(this, updatingPlayer))
            .then(arrayMappers.playerGamesLog.bind(this, {
              player: updatingPlayer,
              manager: $scope.selectedManager
            }))
            .then(function (result) {

              $log.debug('result:', result.stats.goals);
              $log.debug('player:', player.stats.goals);
              $log.debug('updatingPlayer:', updatingPlayer.stats.goals);


            });

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

              $log.debug('////////////////////////////');
              $log.debug('MANAGER DATA UPDATED');
              $log.debug('////////////////////////////');

              var mappedManagers = _.object(_.map(result, function(obj) {
                return [obj.managerName.toLowerCase(), obj];
              }));

              // managerData.data = result;

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

        $log.debug(managerData.data);
        // $scope.saveRoster(managerData.data);

      };

      $rootScope.$on('MONTH_CHANGED', function (e, month) {
        $scope.currentMonthLog = _.chain($scope.selectedManager.filteredMonthlyGoalsLog)
          .flatten(true)
          .filter(arrayFilter.filterOnMonth.bind($scope, month))
          .value();
      });

      loadData();

    });

})();
