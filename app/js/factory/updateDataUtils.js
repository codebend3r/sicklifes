/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$updateDataUtils', function ($apiFactory, $objectUtils, $q, $managersService, $momentService, $fireBaseService, $textManipulator, $arrayMappers, $rootScope) {

      var updateDataUtils = {

        /**
         * gets data from all of the players in all valid leagues
         */
        updatePlayerPoolData: function (callback) {

          console.log('$updateDataUtils -- updatePlayerPoolData');

          var allTeams = $apiFactory.getAllTeams(),
            allTeamsPromise = [],
            allPlayers = [];

          // returns a list of promise with the end point for each league
          $apiFactory.listOfPromises(allTeams, function (result) {

            _.each(result, function (leagueData) {

              _.each(leagueData.data, function (teamData) {

                //console.log('LEAGUE:', leagueData.leagueName, ', TEAM:', teamData.full_name);

                // returns a promise with the end point for each team
                var rosterRequest = $apiFactory.getData({
                  endPointURL: $textManipulator.getTeamRosterURL(leagueData.leagueName, teamData.id)
                });

                allTeamsPromise.push(rosterRequest);

                rosterRequest.then(function (playerData) {

                  _.each(playerData.data, function (eachPlayer) {
                    console.log(eachPlayer.team.full_name, ':', eachPlayer.full_name);
                  });

                  // each player on each team
                  var rosterArray = _.map(playerData.data, $arrayMappers.transferPlayersMap.bind(this, leagueData, teamData));
                  allPlayers = allPlayers.concat(rosterArray);

                });

              });

            });

            $q.all(allTeamsPromise).then(function () {
              callback(allPlayers);
            });


          });

        },

        /**
         * gets all leagues in teams
         */
        updateLeagueTables: function () {

          console.log('$updateDataUtils -- updateLeagueTables');

          var leagueTables = $apiFactory.getLeagueTables(),
            defer = $q.defer(),
            leagueTablesData = [],
            allLeagues = {
              _lastSyncedOn: $momentService.syncDate()
            };

          // returns a list of promise with the end point for each league
          $apiFactory.listOfPromises(leagueTables, function (promiseData) {

            leagueTablesData = _.map(promiseData, function (result, index) {

              if (index <= 2) {

                return {
                  data: _.map(result.data, $arrayMappers.tableMap)
                };

              } else {

                return {
                  data: _.map(result.data, $arrayMappers.tableTournamentMap)
                };

              }

            });

            defer.resolve(leagueTablesData);

          });

          return defer.promise;

        },

        /**
         * gets data from all of the players in all valid leagues
         */
        updateAllManagerData: function (cb) {

          console.log('$updateDataUtils --> updateAllManagerData');

          var allLeaguePromises = [],
            current = 0,
            total = 0,
            defer = $q.defer();

          if (angular.isUndefinedOrNull($rootScope.managerData)) throw new Error('$rootScope.managerData is not defined');

          var managerData = angular.copy($rootScope.managerData);
          delete managerData._lastSyncedOn;

          _.each(managerData, function (manager) {

            // reset goal counts
            manager = $objectUtils.cleanManager(manager, true);

            total += _.keys(manager.players).length;

            _.each(manager.players, function (player) {

              player = $objectUtils.playerResetGoalPoints(player);

              manager.seriCount = 0;
              manager.ligaCount = 0;
              manager.eplCount = 0;
              manager.chlgCount = 0;
              manager.euroCount = 0;
              manager.wildCardCount = 0;

              //console.log(manager.managerName, '|', player.playerName);

              $apiFactory.getPlayerProfile('soccer', player.id)
                .then($arrayMappers.playerInfo.bind(this, player))
                .then($arrayMappers.playerMapPersonalInfo.bind(this, player))
                .then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: manager }))
                .then(function () {
                  current += 1;
                  //console.log(player.id + ' ' + player.playerName, '|', player.leagueName, '|', player.goals);
                  //console.log(current + '/' + total);
                  if (current === total) {
                    console.log('-- DONE --');
                    //defer.resolve(managerData);
                    if (typeof cb === 'function') {
                      cb(managerData);
                    } else {
                      throw new Error('cb parameter is not type function');
                    }
                  }
                });

            });

          });

          return defer.promise;

        },

        /**
         * fetches all league leaders in goals
         */
        updateLeagueLeadersData: function () {

          console.log('$updateDataUtils --> updateLeagueLeadersData');

          var allLeagues = [],
            defer = $q.defer(),
          // list of all goal scorers in all leagues
            consolidatedGoalScorers = [],
          // makes a request for all leagues in a loop returns a list of promises
            allPromises = $apiFactory.getAllGoalLeaders();

          // waits for an array of promises to resolve, sets allLeagues data
          $apiFactory.listOfPromises(allPromises, function (result) {

            allLeagues = [];

            _.each(result, function (league) {
              var goalsMap = league.data.goals.map($arrayMappers.goalsMap.bind($arrayMappers, $rootScope.managersData, league.leagueURL));
              allLeagues.push({
                name: $textManipulator.properLeagueName(league.leagueName),
                source: goalsMap,
                className: league.leagueName,
                img: $textManipulator.leagueImages[league.leagueName]
              });
              consolidatedGoalScorers = consolidatedGoalScorers.concat(goalsMap);
            });

            defer.resolve(allLeagues);

          });

          return defer.promise;

        }

      };

      return updateDataUtils;

    });

})();
