/**
 * Updated by Bouse on 12/23/2014
 */

angular.module('sicklifes')

  .factory('$updateDataUtils', function ($apiFactory, $objectUtils, $q, $managersService, $dateService, $fireBaseService, $textManipulator, $arrayMappers, $rootScope) {

    var updateDataUtils = {

      /**
       * gets data from all of the players in all valid leagues
       */
      updatePlayerPoolData: function () {

        //console.log('UPDATING PLAYER POOL...');
        console.log('UPDATING -- updatePlayerPoolData');

        var defer = $q.defer(),
          allTeams = $apiFactory.getAllTeams(),
          allTeamsPromise = [],
          allPlayers = [];

        // returns a list of promise with the end point for each league
        $apiFactory.listOfPromises(allTeams, function (result) {

          _.each(result, function (leagueData) {

            _.each(leagueData.data, function (teamData) {

              console.log('LEAGUE:', leagueData.leagueName, ', TEAM:', teamData.full_name);

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
                var rosterArray = playerData.data.map($arrayMappers.transferPlayersMap.bind(this, leagueData, teamData));
                allPlayers = allPlayers.concat(rosterArray);

              });

            });

            $apiFactory.listOfPromises(allTeamsPromise, function (data) {
              defer.resolve(allPlayers);
              console.log('updatePlayerPoolData - ALL COMPLETE', data);
            });

          });


        });

        return defer.promise;

      },

      /**
       * gets all leagues in teams
       */
      updateLeagueTables: function () {

        console.log('UPDATING -- updateLeagueTables');

        var leagueTables = $apiFactory.getLeagueTables(),
          defer = $q.defer(),
          leagueTablesData = [],
          allLeagues = {
            _lastSyncedOn: $dateService.syncDate()
          };

        // returns a list of promise with the end point for each league
        $apiFactory.listOfPromises(leagueTables, function (promiseData) {

          leagueTablesData = _.map(promiseData, function (result) {

            return {
              data: _.map(result.data, $arrayMappers.tableMap)
            };

          });

          //$fireBaseService.syncAllLeagueTeamsData(allLeagues);
          defer.resolve(leagueTablesData);

        });

        //return leagueTablesData;
        return defer.promise;

      },

      /**
       * gets data from all of the players in all valid leagues
       */
      updateAllManagerData: function () {

        console.log('$updateDataUtils --> updateAllManagerData');

        var allLeaguePromises = [],
          defer = $q.defer();

        $rootScope.managersData = $rootScope.managersData || $managersService;

        _.each($rootScope.managersData, function (manager) {

          // reset goal counts
          manager = $objectUtils.cleanManager(manager, true);

          _.each(manager.players, function (player) {

            player = $objectUtils.playerResetGoalPoints(player);

            manager.seriCount = 0;
            manager.ligaCount = 0;
            manager.eplCount = 0;
            manager.chlgCount = 0;
            manager.euroCount = 0;
            manager.wildCardCount = 0;

            var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);

            allLeaguePromises.push(playerProfileRequest);

            playerProfileRequest
              .then($arrayMappers.playerInfo.bind(this, player))
              .then($arrayMappers.playerGamesLog.bind(this, { player: player, manager: manager }));

          });

        });

        $apiFactory.listOfPromises(allLeaguePromises, function (result) {
          defer.resolve(result);
        });

        return defer.promise;

      },

      /**
       * fetches all league leaders in goals
       */
      updateLeagueLeadersData: function () {

        console.log('UPDATING -- updateLeagueLeadersData');

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

      },

      ///////////////////////////////////

      /**
       *
       */
      updateEverything: function () {

        console.log('is managersData undefined:', angular.isUndefinedOrNull($localStorage.get('managersData')));
        console.log('is leagueLeadersData undefined:', angular.isUndefinedOrNull($localStorage.get('leagueLeadersData')));
        console.log('is playerPoolData undefined:', angular.isUndefinedOrNull($localStorage.get('playerPoolData')));
        console.log('is allLeagueTeamsData undefined:', angular.isUndefinedOrNull($localStorage.get('allLeagueTeamsData')));

        ///////////////////////////////////////

        /*$fireBaseService.initialize(updateDataUtils);
         var firePromise = $fireBaseService.getFireBaseData();
         firePromise.then(function (result) {

         console.log('result', result);

         _.each(result, function (resultObj, key) {
         console.log('key', key);
         $localStorage.set(key, resultObj);
         });
         });
         */

        console.log('////////////////////////');

        if (angular.isUndefinedOrNull($localStorage.get('managersData'))) {

          console.log('managersData - no localstorage found');

          updateDataUtils.updateAllManagerData()
            .then(function (result) {
              //result._lastSyncedOn = $dateService.syncDate();
              console.log('managersData - data fetched', result);
              //$localStorage.set('managersData', result);
              //$fireBaseService.syncLeagueLeadersData(result);

            });
        } else {

          console.log('managersData - exists in localstorage');
          var managerObject = $localStorage.get('managersData');
          managerObject._lastSyncedOn = $dateService.syncDate();
          $fireBaseService.syncManagersData(managerObject);

        }

        ///////////////////////////////////////

        /*if (angular.isUndefinedOrNull($localStorage.get('leagueLeadersData'))) {

         console.log('leagueLeadersData - no localstorage found');

         updateDataUtils.updateLeagueLeadersData()
         .then(function (result) {

         console.log('leagueLeadersData - data fetched');

         var saveObject = {
         _lastSyncedOn: $dateService.syncDate(),
         liga: result[0].source,
         epl: result[1].source,
         seri: result[2].source,
         chlg: result[3].source,
         uefa: result[4].source
         };

         $localStorage.set('leagueLeadersData', saveObject);
         $fireBaseService.syncLeagueLeadersData(saveObject);

         });
         } else {

         console.log('leagueLeadersData - exists in localstorage');

         var leagueLeadersObject = $localStorage.get('leagueLeadersData'),
         saveObject = {
         _lastSyncedOn: $dateService.syncDate(),
         liga: leagueLeadersObject.liga,
         epl: leagueLeadersObject.epl,
         seri: leagueLeadersObject.seri,
         chlg: leagueLeadersObject.chlg,
         uefa: leagueLeadersObject.uefa
         };

         $localStorage.set('leagueLeadersData', saveObject);
         $fireBaseService.syncLeagueLeadersData(saveObject);

         }

         ///////////////////////////////////////

         // player pool
         if (angular.isUndefinedOrNull($localStorage.get('playerPoolData'))) {
         updateDataUtils.updatePlayerPoolData()
         .then(function (result) {

         console.log('updatePlayerPoolData LOADED');
         debugger;

         var allPlayersObject = {
         _lastSyncedOn: $dateService.syncDate(),
         allPlayers: result
         };

         $localStorage.set('playerPoolData', allPlayersObject);
         $fireBaseService.syncPlayerPoolData(allPlayersObject);

         });
         } else {

         console.log('playerPoolData exists in localstorage');

         var allPlayersObject = {
         _lastSyncedOn: $dateService.syncDate(),
         allPlayers: $localStorage.get('playerPoolData')
         };

         //console.log('allPlayersObject', allPlayersObject);
         $localStorage.set('playerPoolData', allPlayersObject);
         $fireBaseService.syncPlayerPoolData(allPlayersObject);

         }

         ///////////////////////////////////////

         if (angular.isUndefinedOrNull($localStorage.get('allLeagueTeamsData'))) {

         console.log('allLeagueTeamsData - no localstorage found');

         updateDataUtils.updateTeamsInLeague()
         .then(function (result) {

         console.log('allLeagueTeamsData - data fetched', result);
         $localStorage.set('allLeagueTeamsData', saveObject);
         $fireBaseService.syncAllLeagueTeamsData(result)

         });

         } else {

         console.log('allLeagueTeamsData - exists in localstorage');
         var result = $localStorage.get('allLeagueTeamsData');
         result._lastSyncedOn = $dateService.syncDate();
         $localStorage.set('allLeagueTeamsData', result);
         $fireBaseService.syncAllLeagueTeamsData(result);

         }
         */

      }

    };

    return updateDataUtils;

  });
