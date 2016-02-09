/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('updateDataUtils', function ($rootScope, $q, apiFactory, objectUtils, managersService, momentService, fireBaseService, textManipulator, arrayMappers) {

      var current = 0,
        total = 0;

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
            _.each(result, function (leagueData) {

              _.each(leagueData.data, function (teamData) {

                console.log('LEAGUE:', leagueData.leagueName, ', TEAM:', teamData.full_name);

                // returns a promise with the end point for each team
                var rosterRequest = apiFactory.getData({
                  endPointURL: textManipulator.getTeamRosterURL(leagueData.leagueName, teamData.id)
                });

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
       * @name updateManagerData
       * @description update only one manager
       * @param cb
       * @param manager
       */
      updateDataUtils.updateManagerData = function (cb, manager) {

        console.log('updating -->', manager.managerName);

        // reset goal counts
        manager = objectUtils.cleanManager(manager, true);
        manager._lastSyncedOn = momentService.syncDate();

        total += _.keys(manager.players).length;

        _.each(manager.players, function (player) {

          player = objectUtils.playerResetGoalPoints(player);

          player.managerName = manager.managerName;
          console.log(player.managerName);

          apiFactory.getPlayerProfile('soccer', player.id)
            .then(arrayMappers.playerInfo.bind(this, player), function () {
              console.log('fail 1')
            })
            .then(arrayMappers.playerMapPersonalInfo.bind(this, player), function () {
              console.log('fail 2')
            })
            .then(arrayMappers.playerGamesLog.bind(this, {
              player: player,
              manager: manager
            }), function () {
              console.log('fail 3')
            })
            .then(function (result) {

              // TODO make function available in services
              //console.log(result);

              // if (angular.isUndefinedOrNull(player.status)) {
              //   player.status = 'drafted';
              //   player.dateOfTransaction = '08/01/2015';
              // }
              //
              // if (player.dateOfTransaction === '11/9/2015') {
              //   player.dateOfTransaction = '11/09/2015';
              // }
              //
              // if (player.dateOfTransaction === '08/01/2015') {
              //   player.dateOfTransaction = '08/01/2015';
              // }

              current += 1;
              //$rootScope.percentage = Math.round((current / total) * 100);
              console.log(current, total, player.playerName, player.status);
              //console.log(current);

              if (current === total) {
                if (typeof cb === 'function') {
                  cb(manager);
                } else {
                  throw new Error('cb parameter is not type function');
                }
              }
            }, function () {
              console.log('fail 4')
            });

        });

      };

      /**
       * @name updateAllManagerData
       * @description gets data from all of the players in all valid leagues
       */
      updateDataUtils.updateAllManagerData = function (managersData, cb) {

        console.log('updateDataUtils --> updateAllManagerData');

        var managers = angular.copy(managersData.data);
        _.each(managers, updateDataUtils.updateManagerData.bind(updateDataUtils, function () {
          cb(managers);
        }));

      };

      /**
       * @name updateCoreData
       * @description
       */
      updateDataUtils.updateCoreData = function (cb) {

        console.log('updateDataUtils --> updateCoreData');

        $q.all([apiFactory.getApiData('managersData'), apiFactory.getApiData('leagueTables')])
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
              var goalsMap = league.data.goals.map(arrayMappers.goalsMap.bind(arrayMappers, $rootScope.managersData, league.leagueURL));
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

      return updateDataUtils;

    });

})();
