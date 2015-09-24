/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $arrayLoopers, $momentService, $arrayFilter, $apiFactory, $rootScope, $moment) {

      var arrayMaper = {

        /**
         * maps each player's stats
         * @param managersData
         * @param url
         * @param i
         */
        goalsMap: function (managersData, url, i) {

          var playerInLeague = {
            id: i.player.id,
            url: url || '',
            rank: i.ranking,
            playerName: $textManipulator.formattedFullName(i.player.first_name, i.player.last_name),
            teamName: $textManipulator.teamNameFormatted(i.team.full_name),
            domesticGoals: 0,
            leagueGoals: 0,
            goals: i.stat,
            managerName: $arrayLoopers.getOwnerByID(managersData, i.player.id),
            leagueName: $textManipulator.getLeagueByURL(url),
            transactionsLog: [],
            historyLog: []
          };

          return playerInLeague;

        },

        /**
         * maps league table data for epl, seri, and la liga
         * @param teamData
         * @param index
         */
        tableMap: function (teamData, index) {

          return {
            index: index,
            id: teamData.id,
            logo: teamData.team.logos.small,
            teamId: teamData.team.id,
            record: teamData.wins + '-' + teamData.losses + '-' + teamData.ties,
            goalsFor: teamData.goals_for,
            goalsAgainst: teamData.goals_against,
            gamesPlayed: teamData.games_played,
            rank: teamData.ranking,
            teamName: $textManipulator.teamNameFormatted(teamData.team.full_name),
            points: teamData.points
          };

        },

        /**
         * maps league table data for epl, seri, and la liga
         * @param teamData
         * @param index
         */
        tableTournamentMap: function (teamData, index) {

          //console.log('group:', teamData.group);

          return {
            index: index,
            id: teamData.id,
            group: teamData.group,
            logo: teamData.team.logos.small,
            teamId: teamData.team.id,
            record: teamData.wins + '-' + teamData.losses + '-' + teamData.ties,
            goalsFor: teamData.goals_for,
            goalsAgainst: teamData.goals_against,
            gamesPlayed: teamData.games_played,
            rank: teamData.ranking,
            teamName: $textManipulator.teamNameFormatted(teamData.team.full_name),
            points: teamData.points
          };

        },

        /**
         * makes request for addition into a first param: player
         * including valid leagues, physical attributes
         * @param player - the player object, used in the loop to get sub property
         * @param result - result data passed in from api call
         */
        playerInfo: function (player, result) {

          var deferred = $q.defer(),
            playerLeagueProfileRequest,
            profileLeagueSlug = $textManipulator.getLeagueSlug(result);

          player.id = result.data.id;

          //console.log('id', player.id, player.playerName);

          // do it only if player.teamLogo, and player.teamName doesn't exist
          /*if (result.data.teams[0]) {
           // url for team logo
           player.teamLogo = result.data.teams[0].sportsnet_logos.large;
           // set latest teamName to whatever the first value is in the stack
           player.teamName = $textManipulator.teamNameFormatted(result.data.teams[0].full_name);
           }*/

          // url for player image
          player.playerImage = result.data.headshots.original;

          // returns a concat string with all valid leagues
          player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

          // based on player result data return an object with the valid leagues for this player
          player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

          // set latest leagueName
          //player.leagueName = $textManipulator.properLeagueName(profileLeagueSlug);

          deferred.resolve(result.data);

          ///////////////////////////////////

          playerLeagueProfileRequest = $apiFactory.getPlayerProfile(profileLeagueSlug, player.id);
          playerLeagueProfileRequest.then(function (profileData) {

            player.playerPos = profileData.data.position;
            player.weight = profileData.data.weight;
            player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
            player.birthdate = profileData.data.birthdate;
            player.birthplace = profileData.data.birth_city + ', ' + profileData.data.birth_country;


          });

          return deferred.promise;

        },

        /**
         * forEach function - loops through soccer roster
         * @param dataObj - an object containing a reference to a player and a manager
         * @param result
         */
        playerGamesLog: function (dataObj, result) {

          var deferred = $q.defer(),
            player = dataObj.player || null,
            manager = dataObj.manager || null,
            validLeagues,
            allPromises = [],
            ligaGamesRequest,
            ligaLogs,
            eplGamesRequest,
            eplLogs,
            seriGamesRequest,
            seriLogs,
            chlgGamesRequest,
            chlgLogs,
            euroGamesRequest,
            euroLogs;

          validLeagues = player.validLeagues || {};

          player.leagueSlugs = '';

          if (validLeagues.inLiga) {

            ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id);
            // if player is not dropped then count on active roster

            ligaGamesRequest.then(function (result) {

              ligaLogs = result.data
                .filter($arrayFilter.filterOnValidGoals.bind(this, player))
                .map(arrayMaper.monthlyMapper.bind(this, {
                  player: player,
                  manager: manager || null
                }));

              player.ligaGameLog = result.data
                .filter($arrayFilter.filterAfterDate)
                .map(arrayMaper.gameMapper);

              if (!angular.isUndefinedOrNull(manager)) {
                if (player.status !== 'dropped' && ($rootScope.firebaseData.leagueTables.liga.indexOf(player.teamName) !== -1 || player.ligaGameLog.length > 0)) {
                  manager.ligaCount += 1;
                  player.leagueSlugs += player.leagueSlugs.length === 0 ? 'liga' : '/liga';
                  player.leagueName = 'LA LIGA';
                }
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(ligaLogs);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(ligaLogs);
              }

            });
            allPromises.push(ligaGamesRequest);

          }

          if (validLeagues.inEPL) {

            eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id);
            // if player is not dropped then count on active roster

            eplGamesRequest.then(function (result) {

              eplLogs = result.data
                .filter($arrayFilter.filterOnValidGoals.bind(this, player))
                .map(arrayMaper.monthlyMapper.bind(this, {
                  player: player,
                  manager: manager || null
                }));

              player.eplGameLog = result.data
                .filter($arrayFilter.filterAfterDate)
                .map(arrayMaper.gameMapper);

              if (!angular.isUndefinedOrNull(manager)) {
                if (player.status !== 'dropped' && ($rootScope.firebaseData.leagueTables.epl.indexOf(player.teamName) !== -1 || player.eplGameLog.length > 0)) {
                  manager.eplCount += 1;
                  player.leagueSlugs += player.leagueSlugs.length === 0 ? 'epl' : '/epl';
                  player.leagueName = 'EPL';
                }
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(eplLogs);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(eplLogs);
              }

            });
            allPromises.push(eplGamesRequest);

          }

          if (validLeagues.inSeri) {

            seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id);
            // if player is not dropped then count on active roster
            seriGamesRequest.then(function (result) {
              seriLogs = result.data
                .filter($arrayFilter.filterOnValidGoals.bind(this, player))
                .map(arrayMaper.monthlyMapper.bind(this, {
                  player: player,
                  manager: manager || null
                }));

              player.seriGameLog = result.data
                .filter($arrayFilter.filterAfterDate)
                .map(arrayMaper.gameMapper);

              if (!angular.isUndefinedOrNull(manager)) {
                if (player.status !== 'dropped' && ($rootScope.firebaseData.leagueTables.seri.indexOf(player.teamName) !== -1 || player.seriGameLog.length > 0)) {
                  manager.seriCount += 1;
                  player.leagueSlugs += player.leagueSlugs.length === 0 ? 'seri' : '/seri';
                  player.leagueName = 'SERIE A';
                }
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(seriLogs);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(seriLogs);
              }

            });
            allPromises.push(seriGamesRequest);

          }

          if (validLeagues.inChlg) {

            chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id);
            chlgGamesRequest.then(function (result) {

              chlgLogs = result.data
                .filter($arrayFilter.filterOnValidGoals.bind(this, player))
                .map(arrayMaper.monthlyMapper.bind(this, {
                  player: player,
                  manager: manager || null
                }));

              player.chlgGameLog = result.data
                .filter($arrayFilter.filterAfterDate)
                .map(arrayMaper.gameMapper);

              if (!angular.isUndefinedOrNull(manager)) {
                if (chlgLogs.length > 0 || $rootScope.firebaseData.leagueTables.chlg.indexOf(player.teamName) !== -1 || player.chlgGameLog.length > 0) {
                  manager.chlgCount += 1;
                  player.leagueSlugs += player.leagueSlugs.length === 0 ? 'chlg' : '/chlg';
                  player.tournamentLeagueName = $textManipulator.formattedLeagueName('chlg');
                }
              }
              if (manager) {
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(chlgLogs);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(chlgLogs);
              }
            });

            allPromises.push(chlgGamesRequest);

          }

          if (validLeagues.inEuro) {

            euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);
            euroGamesRequest.then(function (result) {
              euroLogs = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

              player.euroGameLog = result.data
                .filter($arrayFilter.filterAfterDate)
                .map(arrayMaper.gameMapper);

              if (!angular.isUndefinedOrNull(manager)) {
                if (euroLogs.length > 0 || $rootScope.firebaseData.leagueTables.uefa.indexOf(player.teamName) !== -1 || player.euroGameLog.length > 0) {
                  manager.euroCount += 1;
                  player.tournamentLeagueName = $textManipulator.formattedLeagueName('uefa');
                }
              }
              if (manager) {
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(euroLogs);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(euroLogs);
              }
            });
            allPromises.push(euroGamesRequest);

          }

          // logical definition for a wildcard player
          if (angular.isUndefinedOrNull(player.ligaGameLog)
            && angular.isUndefinedOrNull(player.eplGameLog)
            && angular.isUndefinedOrNull(player.seriGameLog)) {
            // if player is not dropped then count on active roster
            if (player.status !== 'dropped' && manager) {
              manager.wildCardCount += 1;
            }
          }

          $q.all(allPromises).then(function () {
            deferred.resolve(player);
          });

          return deferred.promise;

        },

        /**
         * maps each player in the whole player pool
         * @param leagueData
         * @param teamData
         * @param i
         * @param index
         * @returns {{index: *, id: *, playerName: *, managerName: *, teamName: string, leagueName: string}}
         */
        transferPlayersMap: function (leagueData, teamData, i, index) {

          return {
            index: index,
            id: i.id,
            playerName: $textManipulator.formattedFullName(i.first_name, i.last_name),
            managerName: $rootScope.draftMode ? 'Free Agent' : $arrayLoopers.getOwnerByID(i.id),
            teamName: $textManipulator.teamNameFormatted(teamData.full_name),
            teamLogo: teamData.logos.small,
            leagueName: $textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase()
          };

        },

        monthlyMapper: function (dataObj, game, index) {

          var gameMapsObj = {
            index: index,
            id: dataObj.player.id,
            alignment: game.alignment === 'away' ? '@' : 'vs',
            vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
            goalsScored: game.goals || 0,
            teamName: dataObj.player.teamName,
            teamLogo: dataObj.player.teamLogo,
            //leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
            leagueSlug: game.box_score.event.league.slug,
            datePlayed: $momentService.goalLogDate(game.box_score.event.game_date),
            //rawDatePlayed: $moment(game.box_score.event.game_date),
            originalDate: game.box_score.event.game_date,
            playerName: $textManipulator.stripVowelAccent(dataObj.player.playerName),
            managerName: dataObj.player.managerName || 'N/A',
            result: $textManipulator.result.call(gameMapsObj, game),
            finalScore: $textManipulator.finalScore.call(gameMapsObj, game)
          };

          var gameGoals = gameMapsObj.goalsScored,
            leagueSlug = gameMapsObj.leagueSlug,
            computedPoints;

          //dataObj.player.leagueName = gameMapsObj.leagueName;

          if ($textManipulator.acceptedLeague(leagueSlug)) {

            computedPoints = $scoringLogic.calculatePoints(gameGoals, leagueSlug);

            if ($textManipulator.isDomesticLeague(leagueSlug)) {

              dataObj.player.domesticGoals += gameGoals;
              if (dataObj.manager) dataObj.manager.domesticGoals += gameGoals;

            } else if ($textManipulator.isChampionsLeague(leagueSlug)) {

              dataObj.player.clGoals += gameGoals;
              if (dataObj.manager) dataObj.manager.clGoals += gameGoals;

            } else if ($textManipulator.isEuropaLeague(leagueSlug)) {

              dataObj.player.eGoals += gameGoals;
              if (dataObj.manager) dataObj.manager.eGoals += gameGoals;

            }

            // increment goals for each player
            dataObj.player.goals += gameGoals;

            // increment goals for the manager
            if (dataObj.manager) dataObj.manager.totalGoals += gameGoals;

            // increment points
            dataObj.player.points += computedPoints;
            if (dataObj.manager) dataObj.manager.totalPoints += computedPoints;

          }

          // gameMapsObj maps to a player
          return gameMapsObj;

        },

        /**
         * maps each game data in player details view
         */
        gameMapper: function (game) {

          var gameMapsObj = {
            alignment: game.alignment === 'away' ? '@' : 'vs',
            vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
            goalsScored: game.goals || 0,
            leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
            datePlayed: $momentService.goalLogDate(game.box_score.event.game_date),
            //rawDatePlayed: $moment(game.box_score.event.game_date),
            originalDate: game.box_score.event.game_date,
            result: $textManipulator.result.call(gameMapsObj, game),
            finalScore: $textManipulator.finalScore.call(gameMapsObj, game)
          };

          return gameMapsObj;

        }

      };

      return arrayMaper;

    });

})();
