/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $arrayLoopers, $momentService, $arrayFilter, $apiFactory, $rootScope, $moment) {

      var arrayMaper = {};

      /**
       * maps each player's stats
       * @param managersData
       * @param url
       * @param i
       */
      arrayMaper.goalsMap = function (managersData, url, i) {

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

      };

      /**
       * maps league table data for epl, seri, and la liga
       * @param teamData
       * @param index
       */
      arrayMaper.tableMap = function (teamData, index) {

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
        arrayMaper.tableTournamentMap = function (teamData, index) {

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

        };

      /**
       * makes request for addition into a first param: player
       * including valid leagues, physical attributes
       * @param player - the player object, used in the loop to get sub property
       * @param result - result data passed in from api call
       */
      arrayMaper.playerInfo = function (player, result) {

        //console.log('playerInfo', player, result);

        var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

        player.id = result.data.id;

        player.playedInLigaGames = false;
        player.playedInEPLGames = false;
        player.playedInSeriGames = false;

        // url for player image
        player.playerImage = result.data.headshots.original;

        // returns a concat string with all valid leagues
        player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

        // based on player result data return an object with the valid leagues for this player
        player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

        // set latest leagueName
        //player.leagueName = $textManipulator.properLeagueName(profileLeagueSlug);

        ///////////////////////////////////

        return $apiFactory.getPlayerProfile(profileLeagueSlug, player.id);

      };

      /**
       * @description forEach function - loops through soccer roster
       * @param dataObj - an object containing a reference to a player and a manager
       * @param result
       */
      arrayMaper.playerMapPersonalInfo = function (player, result) {

        player.playerPos = result.data.position;
        player.weight = result.data.weight;
        player.height = result.data.height_feet + '\'' + result.data.height_inches;
        player.birthdate = result.data.birthdate;
        player.birthplace = result.data.birth_city + ', ' + result.data.birth_country;

      };

      /**
       * @description forEach function - loops through soccer roster
       * @param dataObj - an object containing a reference to a player and a manager
       * @param result
       */
      arrayMaper.playerGamesLog = function (dataObj, result) {

        //console.log('playerGamesLog');

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

          ligaGamesRequest.then(function (result) {

            player.playedInLigaGames = true;

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

          eplGamesRequest.then(function (result) {

            player.playedInEPLGames = true;

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

          seriGamesRequest.then(function (result) {

            player.playedInSeriGames = true;

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
            euroLogs = result.data
              .filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
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

        $q.all(allPromises).then(function () {
          deferred.resolve(player);
        });

        return deferred.promise;

      };

      /**
       * maps each player in the whole player pool
       * @param leagueData
       * @param teamData
       * @param i
       * @param index
       * @returns {{index: *, id: *, playerName: *, managerName: *, teamName: string, leagueName: string}}
       */
      arrayMaper.transferPlayersMap = function (leagueData, teamData, i, index) {

        //console.log('transferPlayersMap');

        return {
          index: index,
          id: i.id,
          playerName: $textManipulator.formattedFullName(i.first_name, i.last_name),
          managerName: $rootScope.draftMode ? 'Free Agent' : $arrayLoopers.getOwnerByID(i.id),
          teamName: $textManipulator.teamNameFormatted(teamData.full_name),
          teamLogo: teamData.logos.small,
          leagueName: $textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase()
        };

      };

      arrayMaper.monthlyMapper = function (dataObj, game, index) {

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

      };

      /**
       * maps each game data in player details view
       */
      arrayMaper.gameMapper = function (game) {

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

      };

      return arrayMaper;

    });

})();
