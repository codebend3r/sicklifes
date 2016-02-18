/**
 * Created by Bouse on 02/16/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('updateDataUtils', function ($rootScope, $q, $http, apiFactory, objectUtils, managersService, momentService, transferDates, textManipulator, arrayMappers) {

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
       * @name updateAllManagerData
       * @description gets data from all of the players in all valid leagues
       * @returns {promise}
       */
      updateDataUtils.updateAllManagerData = function (managerData) {

        console.log('updateDataUtils.updateAllManagerData()');

        var promises = [];

        apiFactory.getApiData('leagueTables');

        _.each(managerData, function (m) {
          var request = updateDataUtils.updateManagerData(m);
          promises.push(request);
        });

        return $q.all(promises);

      };

      /**
       * @name updateManagerData
       * @description update only one manager
       * @param cb
       * @param manager
       * @returns {promise}
       */
      updateDataUtils.updateManagerData = function (manager) {

        console.log('updateDataUtils.updateManagerData()');

        var defer = $q.defer();
        var current = 0;
        var total = 0;
        var requestPlayer = function (player) {

          player = objectUtils.playerResetGoalPoints(player);

          manager.monthlyGoalsLog = [];
          manager.filteredMonthlyGoalsLog = [];
          manager.charts = [];

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
          console.warn('try again, object does not contain \'players\' property');
        }

        return defer.promise;

      };

      /**
       * @name updateLeagueTables
       * @description gets all leagues in teams
       */
      updateDataUtils.updateLeagueTables = function () {

        console.log('updateDataUtils --> updateLeagueTables');

        var defer = $q.defer(),
          leagueTablesData = [];

        // returns a list of promise with the end point for each league
        $q.all(apiFactory.getLeagueTables())
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

      /**
       * @name recoverFromManagerCore
       * @returns {promise}
       */
      updateDataUtils.recoverFromManagerCore = function () {

        var defer = $q.defer();

        $q.all([apiFactory.getApiData('managerCore')])

          .then(function () {

            var rebuildTeams = {
              data: {},
              _lastSyncedOn: momentService.syncDate()
            };

            _.each($rootScope.managerCore.data, function (manager) {

              _.each(manager.players, function (player) {

                var managerKey = player.managerName.toLowerCase();

                if (angular.isUndefinedOrNull(rebuildTeams.data[managerKey])) {
                  rebuildTeams.data[managerKey] = {};
                  rebuildTeams.data[managerKey].managerName = player.managerName;
                  rebuildTeams.data[managerKey].players = {};
                }

                angular.isUndefinedOrNull(player.pickNumber) && (player.pickNumber = 999);
                angular.isUndefinedOrNull(player.dateOfTransaction) && (player.dateOfTransaction = transferDates.leagueStart.date);

                rebuildTeams.data[managerKey].players[player.id] = player;

              });

            });

            /*
             JOE
             Cristiano RONALDO
             Alexis SANCHEZ
             James RODRIGUEZ
             Aritz ADURIZ
             Wilfried BONY
             Memphis DEPAY
             Jose Maria CALLEJON
             Kevin GAMEIRO
             Saido BERAHINO
             Manolo GABBIADINI
             Robert LEWANDOWSKI
             Domenico BERARDI
             Mikel ARRUABARRENA
             Leonardo PAVOLETTI
             Daniel PAREJO
             Riyad MAHREZ
             Ricardo KISHNA
             Danny INGS
             Antonio CANDREVA
             Antonio FLORO FLORES
             Papiss CISSE
             JOZABED
             Franco BRIENZA
             OSCAR
             Cheikhou KOUYATE
             Ivan RAKITIC
             Ruben ROCHINA
             Borja BASTON
             */

            /*
             JUSTIN
             Lionel MESSI
             Wayne ROONEY
             Olivier GIROUD
             Mario MANDZUKIC
             Harry KANE
             Ciro IMMOBILE
             Eden HAZARD
             Paco ALCACER
             Luiz ADRIANO
             Juan MATA
             Iago FALQUE
             Mario GOTZE
             Carlos VELA
             Lorenzo INSIGNE
             JONATHAS
             Nordin AMRABAT
             Yohan CABAYE
             Andre AYEW
             Duvan ZAPATA
             Massimo MACCARONE
             Keita BALDE
             Jamie VARDY
             RODRIGO
             Javi GUERRA
             Gregoire DEFREL
             Marko ARNAUTOVIC
             Antonio SANABRIA
             */

            var franksPicks = [
              'NEYMAR',
              'Antoine GRIEZMANN',
              'Gonzalo HIGUAIN',
              'Mauro ICARDI',
              'Bafetimbi GOMIS',
              'NOLITO',
              'Ruben CASTRO',
              'Luca TONI',
              'Fernando TORRES',
              'Antonio DI NATALE',
              'Theo WALCOTT',
              'Zlatan IBRAHIMOVIC',
              'Mario BALOTELLI',
              'David SILVA',
              'Marek HAMSIK',
              'Luciano VIETTO',
              'German DENIS',
              'Rudy GESTEDE',
              'Jeremain LENS',
              'Jesse LINGARD',
              'LUCAS PEREZ',
              'Josip ILICIC',
              'KOKE',
              'Jay RODRIGUEZ',
              'Ryan MASON',
              'Miralem PJANIC',
              'Georginio WIJNALDUM',
              'WILLIAN'
            ];

            var frank = rebuildTeams.data['frank'].players;

            _.each(frank, function(p) {

             _.each(franksPicks, function(element, index) {

               if (p.playerName === element) {
                 console.log('matching', element);
                 p.pickNumber = index + 1;
               }

             });

            });

            console.log('> rebuildTeams', rebuildTeams);

            defer.resolve(rebuildTeams);

          });

        return defer.promise;

      };

      /**
       * @name recoverFromPoolData
       * @returns {promise}
       */
      updateDataUtils.recoverFromPoolData = function () {

        var defer = $q.defer();

        $q.all([apiFactory.getApiData('managerCore'), apiFactory.getApiData('playerPoolData')])

          .then(function () {

            var rebuildTeams = {
              data: {},
              _lastSyncedOn: momentService.syncDate()
            };

            _.each($rootScope.playerPoolData.allPlayers, function (player) {

              if (player.status === 'drafted' || player.status === 'added' || player.status === 'dropped') {

                var managerKey = player.managerName.toLowerCase();

                if (angular.isUndefinedOrNull(rebuildTeams.data[managerKey])) {
                  rebuildTeams.data[managerKey] = {};
                  rebuildTeams.data[managerKey].managerName = player.managerName;
                  rebuildTeams.data[managerKey].players = {};
                }

                rebuildTeams.data[managerKey].players[player.id] = player;
                console.log('> player', player);

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
