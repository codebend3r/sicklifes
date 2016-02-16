/**
 * Created by Bouse on 02/16/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('updateDataUtils', function ($rootScope, $q, $http, apiFactory, objectUtils, managersService, momentService, fireBaseService, textManipulator, arrayMappers) {

      var updateDataUtils = {};

      /**
       * @name updatePlayerPoolData
       * @description gets data from all of the players in all valid leagues
       */
      updateDataUtils.updatePlayerPoolData = function (callback) {

        console.log('updateDataUtils -- updatePlayerPoolData');

        var allTeams = apiFactory.getAllTeams(),
          allTeamsPromise = [],
          allPlayers = [];

        // returns a list of promise with the end point for each league
        $q.all(allTeams)
          .then(function (result) {

            //loop through each result
            _.each(result, function (leagueData) {

              _.each(leagueData.data, function (teamData) {

                console.log('LEAGUE:', leagueData.slug, ', TEAM:', teamData.full_name);

                // returns a promise with the end point for each team
                var rosterRequest = apiFactory.getTeamRosterURL(leagueData.slug, teamData.id);

                allTeamsPromise.push(rosterRequest);

                rosterRequest.then(function (playerData) {

                  _.each(playerData.data, function (eachPlayer) {
                    console.log(eachPlayer.team.full_name, ':', eachPlayer.full_name);
                  });

                  // each player on each team
                  var rosterArray = _.map(playerData.data, arrayMappers.transferPlayersMap.bind(this, leagueData, teamData));
                  allPlayers = allPlayers.concat(rosterArray);

                });

              });

            });

            $q.all(allTeamsPromise).then(function () {
              callback(allPlayers);
            });

          });

      };

      /**
       * @name filterManagerData
       * @description TODO
       */
      updateDataUtils.mapManagerData = function(managerData) {

        console.log('OOPS');

        // var gameLogsObject = {};
        // var chartsObj = {};
        // var playersObj = {};
        // var index = 0;
        //
        // _.each(managerData, function (manager, key) {
        //
        //   manager.id = index++;
        //
        //   gameLogsObject[key] = {
        //     filteredMonthlyGoalsLog: manager.filteredMonthlyGoalsLog,
        //     monthlyGoalsLog: manager.monthlyGoalsLog
        //   }
        //
        //   chartsObj[key] = {
        //     chartData: manager.chartData
        //   }
        //
        //   playersObj[key] = {
        //     players: manager.players
        //   }
        //
        //   angular.isDefined(manager.filteredMonthlyGoalsLog) && delete manager.filteredMonthlyGoalsLog;
        //   angular.isDefined(manager.monthlyGoalsLog) && delete manager.monthlyGoalsLog;
        //   angular.isDefined(manager.chartData) && delete manager.chartData;
        //   angular.isDefined(manager.players) && delete manager.players;
        //
        //   _.each(manager.player, function(player) {
        //
        //     angular.isDefined(player.seriGameLog) && delete player.seriGameLog;
        //     angular.isDefined(player.eplGameLog) && delete player.eplGameLog;
        //     angular.isDefined(player.ligaGameLog) && delete player.ligaGameLog;
        //     angular.isDefined(player.chlgGameLog) && delete player.chlgGameLog;
        //     angular.isDefined(player.euroGameLog) && delete player.euroGameLog;
        //     angular.isDefined(player.allLeaguesName) && delete player.allLeaguesName;
        //
        //   });
        //
        // });

      };

      /**
       * @name saveManagerData
       * @description TODO
       */
      updateDataUtils.saveManagerData = function(managerData) {

        console.log('gameLogsObject', gameLogsObject);
        console.log('chartsObj', chartsObj);
        console.log('peoplesObj', peoplesObj);
        console.log('managerData', managerData.data);

        $timeout(function () {

          $scope.saveRoster();

          $scope.saveToFireBase({
            data: chartsObj,
            _lastSyncedOn: momentService.syncDate()
          }, 'charts');

          $scope.saveToFireBase({
            data: gameLogsObject,
            _lastSyncedOn: momentService.syncDate()
          }, 'gameLogs');

          $scope.saveToFireBase({
            data: playersObj,
            _lastSyncedOn: momentService.syncDate()
          }, 'managerPlayers');

        }, 1500);

      };

      /**
       * @name updateAllManagerData
       * @description gets data from all of the players in all valid leagues
       * @returns {promise}
       */
      updateDataUtils.updateAllManagerData = function (managerData) {

        console.log('updateDataUtils --> updateAllManagerData', managerData);

        var defer = $q.defer();
        var managers = angular.copy(managerData);
        var stupidCount = 0;

        _.each(managers, function(m) {
          var request = updateDataUtils.updateManagerData(m)
            .then(function(result) {
              stupidCount += 1;
              if (stupidCount === _.keys(managerData).length) {
                console.log('ALL MANAGERS DATA RESOLVED');
                defer.resolve(managers);
              }
            });

        });

        return defer.promise;

      };

      /**
       * @name updateManagerData
       * @description update only one manager
       * @param cb
       * @param manager
       * @returns {promise}
       */
      updateDataUtils.updateManagerData = function (manager) {

        console.log('updating -->', manager.managerName);

        var defer = $q.defer();
        var current = 0;
        var total = 0;
        var listOrPromises = [];
        var requestPromise;
        var requestPlayer = function (player) {

          player = objectUtils.playerResetGoalPoints(player);

          //player.managerName = manager.managerName;

          apiFactory.getPlayerProfile('soccer', player.id)
            .then(arrayMappers.playerInfo.bind(this, player), function () {
              console.log('failed at player info mapping:', player.playerName)
            })
            .then(arrayMappers.playerMapPersonalInfo.bind(this, player), function () {
              console.log('failed at player personal info mapping:', player.playerName);
            })
            .then(arrayMappers.playerGamesLog.bind(this, {
              player: player,
              manager: manager
            }), function () {
              console.log('failed at player game logs', player.playerName)
            })
            .then(function (result) {
              current += 1;
              console.log('COMPLETED:', player.playerName, Math.round((current / total) * 100));
              if (current === total) {
                console.log('///////////////////////////////////////');
                console.log('RESOLVE PROMISE:', manager.managerName);
                console.log('///////////////////////////////////////');
                defer.resolve(manager);
              }
            }, function () {
              console.log('failed at final stage:', player.playerName)
            });

        };

        if (angular.isDefined(manager.players)) {

          // reset goal counts
          manager = objectUtils.cleanManager(manager, true);
          manager._lastSyncedOn = momentService.syncDate();

          total = _.keys(manager.players).length;
          _.each(manager.players, requestPlayer);

        } else {
          console.warn('try again');
        }

        return defer.promise;

      };

      /**
       * @name updateCoreData
       * @description
       */
      updateDataUtils.updateCoreData = function (cb) {

        console.log('updateDataUtils --> updateCoreData');

        $q.all([apiFactory.getApiData('managerData'), apiFactory.getApiData('leagueTables')])
          .then(function () {
            cb();
          });

      };

      /**
       * @name updateLeagueTables
       * @description gets all leagues in teams
       */
      updateDataUtils.updateLeagueTables = function () {

        console.log('updateDataUtils --> updateLeagueTables');

        var leagueTables = apiFactory.getLeagueTables(),
          defer = $q.defer(),
          leagueTablesData = [],
          allLeagues = {
            _lastSyncedOn: momentService.syncDate()
          };

        // returns a list of promise with the end point for each league
        $q.all(leagueTables)
          .then(function (promiseData) {

            leagueTablesData = _.map(promiseData, function (result, index) {

              if (index <= 2) {

                return {
                  data: _.map(result.data, arrayMappers.tableMap)
                };

              } else {

                return {
                  data: _.map(result.data, arrayMappers.tableTournamentMap)
                };

              }

            });

            defer.resolve(leagueTablesData);

          });

        return defer.promise;

      };

      /**
       * @name updateLeagueLeadersData
       * @description fetches all league leaders in goals
       */
      updateDataUtils.updateLeagueLeadersData = function () {

        console.log('updateDataUtils --> updateLeagueLeadersData');

        var allLeagues = [],
          defer = $q.defer(),
        // list of all goal scorers in all leagues
          consolidatedGoalScorers = [],
        // makes a request for all leagues in a loop returns a list of promises
          allPromises = apiFactory.getAllGoalLeaders();

        // waits for an array of promises to resolve, sets allLeagues data
        $q.all(allPromises)
          .then(function (result) {
            allLeagues = [];
            _.each(result, function (league) {
              var goalsMap = league.data.goals.map(arrayMappers.goalsMap.bind(arrayMappers, $rootScope.managerData, league.leagueURL));
              allLeagues.push({
                name: textManipulator.properLeagueName(league.leagueName),
                source: goalsMap,
                className: league.leagueName,
                img: textManipulator.leagueImages[league.leagueName]
              });
              consolidatedGoalScorers = consolidatedGoalScorers.concat(goalsMap);
            });

            defer.resolve(allLeagues);

          });

        return defer.promise;

      };

      updateDataUtils.recoverManagerData = function(allPlayers) {

        var defer = $q.defer();

        $q.all([ apiFactory.getApiData('leagueTables'), apiFactory.getApiData('managerCore') ])

          .then(function() {

            var rebuildTeams = {
              data: {},
              _lastSyncedOn: momentService.syncDate()
            };

            _.each(allPlayers, function(player) {
              if (player.status === 'drafted' || player.status === 'added' || player.status === 'dropped') {

                var managerKey = player.managerName.toLowerCase();

                if (angular.isUndefinedOrNull(rebuildTeams.data[managerKey])) {
                  rebuildTeams.data[managerKey] = {};
                  rebuildTeams.data[managerKey].managerName = player.managerName;
                  rebuildTeams.data[managerKey].players = {};
                }

                rebuildTeams.data[managerKey].players[player.id] = {
                  id: player.id,
                  status: player.status,
                  managerName: player.managerName,
                  playerName: player.playerName
                }

              }
            });

            defer.resolve(rebuildTeams);

            //$scope.saveToFireBase(rebuildTeams, 'managerCore');

          });

        return defer.promise;

      };

      return updateDataUtils;

    });

})();
