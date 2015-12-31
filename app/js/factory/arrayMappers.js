/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('arrayMappers', function ($rootScope, $q, textManipulator, scoringLogic, objectUtils, momentService, arrayFilter, apiFactory) {

      var arrayMapper = {};

      /**
       * @description maps each player's stats
       * @param managersData
       * @param url
       * @param i
       */
      arrayMapper.goalsMap = function (managersData, url, i) {

        return {
          id: i.player.id,
          url: url || '',
          rank: i.ranking,
          playerName: textManipulator.formattedFullName(i.player.first_name, i.player.last_name),
          teamName: textManipulator.teamNameFormatted(i.team.full_name),
          domesticGoals: 0,
          leagueGoals: 0,
          goals: i.stat,
          managerName: arrayLoopers.getOwnerByID(managersData, i.player.id),
          leagueName: textManipulator.getLeagueByURL(url),
          transactionsLog: [],
          historyLog: []
        };

      };

      /**
       * @description maps league table data for epl, seri, and la liga
       * @param teamData
       * @param index
       */
      arrayMapper.tableMap = function (teamData, index) {

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
          teamName: textManipulator.teamNameFormatted(teamData.team.full_name),
          points: teamData.points
        };

      };

      /**
       * @description maps league table data for epl, seri, and la liga
       * @param teamData
       * @param index
       */
      arrayMapper.tableTournamentMap = function (teamData, index) {

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
          teamName: textManipulator.teamNameFormatted(teamData.team.full_name),
          points: teamData.points
        };

      };

      /**
       * @description makes request for addition into a first param: player
       * @description including valid leagues, physical attributes
       * @param player - the player object, used in the loop to get sub property
       * @param result - result data passed in from api call
       */
      arrayMapper.playerInfo = function (player, result) {

        var profileLeagueSlug = textManipulator.getLeagueSlug(result);

        player.playedInLigaGames = false;
        player.playedInEPLGames = false;
        player.playedInSeriGames = false;
        player.playedInChlgGames = false;
        player.playedInEuroGames = false;

        // reset assists
        player.assists = 0;

        // url for player image
        player.playerImage = result.data.headshots.original;

        // returns a concat string with all valid leagues
        player.allLeaguesName = textManipulator.validLeagueNamesFormatted(result);

        // based on player result data return an object with the valid leagues for this player
        player.validLeagues = textManipulator.getPlayerValidLeagues(result);

        // console.log('>', player.playerName, player.id);

        return apiFactory.getPlayerProfile(profileLeagueSlug, player.id);

      };

      /**
       * @description forEach function - loops through soccer roster
       * @param player - player object
       * @param result
       */
      arrayMapper.playerMapPersonalInfo = function (player, result) {

        //console.log('playerMapPersonalInfo > result', result);

        player.position = result.data.position;
        player.pos = result.data.position_abbreviation;
        player.weight = result.data.weight;
        player.height = result.data.height_feet + '\'' + result.data.height_inches;
        player.birthdate = result.data.birthdate;
        player.birthplace = result.data.birth_city + ', ' + result.data.birth_country;
        player.teamName = result.data.team.full_name;
        player.teamLogo = result.data.team.logos.large;

      };

      /**
       * @description forEach function - loops through soccer roster
       * @name playerGamesLog
       * @param dataObj - an object containing a reference to a player and a manager
       * @param result
       */
      arrayMapper.playerGamesLog = function (dataObj, result) {

        var deferred = $q.defer(),
          player = dataObj.player || null,
          manager = dataObj.manager || null,
          validLeagues,
          allPromises = [],
          ligaGamesRequest,
          eplGamesRequest,
          seriGamesRequest,
          chlgGamesRequest,
          euroGamesRequest;

        validLeagues = player.validLeagues || {};

        player.leagueSlugs = '';

        // console.log('playerGamesLog:', player.playerName, validLeagues);

        if (validLeagues.inLiga) {

          // LA LIGA

          ligaGamesRequest = apiFactory.getPlayerLog('liga', player.id);

          ligaGamesRequest.then(function (result) {

            player.ligaCompleteLog = result.data
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate)

            player.ligaFilteredGameLog = player.ligaCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .forEach(arrayMapper.calculatePoints);

            var foundTeam = _.where($rootScope.leagueTables.liga, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.ligaCompleteLog.length)) {
              player.playedInLigaGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'liga' : '/liga';
              player.leagueName = 'LIGA';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInLigaGames && player.status !== 'dropped') manager.ligaCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.ligaCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.ligaFilteredGameLog);
            }


          });

          allPromises.push(ligaGamesRequest);

        }

        if (validLeagues.inEPL) {

          // EPL

          eplGamesRequest = apiFactory.getPlayerLog('epl', player.id);

          eplGamesRequest.then(function (result) {

            player.eplCompleteLog = result.data
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.eplFilteredGameLog = player.eplCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .forEach(arrayMapper.calculatePoints);

            var foundTeam = _.where($rootScope.leagueTables.epl, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.eplCompleteLog.length)) {
              player.playedInEPLGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'epl' : '/epl';
              player.leagueName = 'EPL';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInEPLGames && player.status !== 'dropped') manager.eplCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.eplCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.eplFilteredGameLog);
            }


          });

          allPromises.push(eplGamesRequest);

        }

        if (validLeagues.inSeri) {

          // SERIE A

          seriGamesRequest = apiFactory.getPlayerLog('seri', player.id);

          seriGamesRequest.then(function (result) {

            result.data
              .some(function (game) {
                if (game.id === 28151164) {
                  game.goals = 1;
                  console.log('adjustment:', game);
                  return true;
                } else {
                  return false;
                }
              })

            player.seriCompleteLog = result.data
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.seriFilteredGameLog = player.seriCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .forEach(arrayMapper.calculatePoints);

            var foundTeam = _.where($rootScope.leagueTables.seri, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.seriCompleteLog.length)) {
              player.playedInSeriGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'seri' : '/seri';
              player.leagueName = 'SERI';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInSeriGames && player.status !== 'dropped') manager.seriCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.seriCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.seriFilteredGameLog);
            }


          });

          allPromises.push(seriGamesRequest);

        }

        if (validLeagues.inChlg) {

          // CHAMPIONS LEAGUE

          chlgGamesRequest = apiFactory.getPlayerLog('chlg', player.id);
          chlgGamesRequest.then(function (result) {

            player.chlgCompleteLogs = result.data
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.chlgFilteredGameLog = player.chlgCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .forEach(arrayMapper.calculatePoints);

            var foundTeam = _.where($rootScope.leagueTables.chlg, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.chlgCompleteLogs.length)) {
              player.playedInChlgGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'chlg' : '/chlg';
              player.tournamentLeagueName = textManipulator.formattedLeagueName('chlg');
              //player.leagueName = 'CHLG';
            }
            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInChlgGames) manager.chlgCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.chlgCompleteLogs);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.chlgFilteredGameLog);
            }


          });

          allPromises.push(chlgGamesRequest);

        }

        if (validLeagues.inEuro) {

          // EUROPA LEAGUE

          euroGamesRequest = apiFactory.getPlayerLog('uefa', player.id);

          euroGamesRequest.then(function (result) {

            player.euroCompleteLogs = result.data
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.euroFilteredGameLog = player.euroCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .forEach(arrayMapper.calculatePoints);

            var foundTeam = _.where($rootScope.leagueTables.uefa, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.euroCompleteLogs.length)) {
              player.playedInEuroGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'euro' : '/euro';
              player.tournamentLeagueName = textManipulator.formattedLeagueName('uefa');
              //player.leagueName = 'EURO';
            }
            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInEuroGames) manager.euroCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.euroCompleteLogs);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.euroFilteredGameLog);
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
       * @name getOwnerByID
       * @description loops through all managers roster and finds owner by player id
       */
      arrayMapper.getOwnerByID = function (id) {

        var owner = 'Free Agent';

        _.some($rootScope.managersData.data, function (manager) {
          _.some(manager.players, function (p) {
            if (p.id === id) {
              owner = manager.managerName;
              return true;
            }
          });
        });

        return owner;

      };

      /**
       * @name transferPlayersMap
       * @description maps each player in the whole player pool
       * @param leagueData
       * @param teamData
       * @param i
       * @param index
       * @returns {{index: *, id: *, playerName: *, managerName: *, teamName: string, leagueName: string}}
       */
      arrayMapper.transferPlayersMap = function (leagueData, teamData, i, index) {

        return {
          index: index,
          id: i.id,
          playerName: textManipulator.formattedFullName(i.first_name, i.last_name),
          managerName: $rootScope.draftMode ? 'Free Agent' : arrayMapper.getOwnerByID(i.id),
          teamName: textManipulator.teamNameFormatted(teamData.full_name),
          teamLogo: teamData.logos.small,
          leagueName: textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase()
        };

      };

      /**
       * @name calculatePoints
       * @description takes previous built object
       * @param dataObj
       */
      arrayMapper.calculatePoints = function (dataObj) {

        var computedPoints;

        //console.log(player.playerName, '|', manager.managerName, player.goalsScored);
        debugger;

        if (textManipulator.acceptedLeague(player.leagueSlug)) {

          computedPoints = scoringLogic.calculatePoints(player.goalsScored, player.leagueSlug);

          if (textManipulator.isDomesticLeague(player.leagueSlug)) {

            // is in domestic league
            if (player) player.domesticGoals += player.goalsScored;
            if (manager) manager.domesticGoals += player.goalsScored;

          } else if (textManipulator.isChampionsLeague(player.leagueSlug)) {

            // is in champions league
            if (player) player.clGoals += player.goalsScored;
            if (manager) manager.clGoals += player.goalsScored;

          } else if (textManipulator.isEuropaLeague(player.leagueSlug)) {

            // is in europa league
            if (player) player.eGoals += player.goalsScored;
            if (manager) manager.eGoals += player.goalsScored;

          }

          // increment goals for each player
          if (player) player.goals += player.goalsScored;

          // increment goals for the manager
          if (manager) manager.totalGoals += player.goalsScored;

          // increment points
          if (player) {
            player.points += computedPoints;
          }

          if (manager) manager.totalPoints += computedPoints;

        }

        if (player) player.assists += player.assists;

        return player;

      }

      /**
       * @name monthlyMapper
       * @description called by playerGamesLog map function, builds the object per each player
       */
      arrayMapper.monthlyMapper = function (dataObj, game, index) {

        var gameMapsObj = {};

        gameMapsObj.index = index;
        gameMapsObj.id = dataObj.player.id;
        gameMapsObj.playerName = dataObj.player.playerName;
        gameMapsObj.alignment = game.alignment === 'away' ? '@' : 'vs';
        gameMapsObj.vsTeam = game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name;
        gameMapsObj.leagueSlug = game.box_score.event.league.slug;
        gameMapsObj.goalsScored = game.goals || 0;
        gameMapsObj.points = scoringLogic.calculatePoints(gameMapsObj.goalsScored, gameMapsObj.leagueSlug) || scoringLogic.calculatePoints(0, gameMapsObj.leagueSlug);
        gameMapsObj.assists = game.assists || 0;
        gameMapsObj.shots = game.shots || 0;
        gameMapsObj.shotsOnGoal = game.shots_on_goal || 0;
        gameMapsObj.minutesPlayed = game.minutes_played || 0;
        gameMapsObj.teamName = dataObj.player.teamName;
        gameMapsObj.teamLogo = dataObj.player.teamLogo;
        gameMapsObj.datePlayed = momentService.goalLogDate(game.box_score.event.game_date);
        gameMapsObj.originalDate = game.box_score.event.game_date;
        gameMapsObj.managerName = dataObj.manager ? dataObj.manager.managerName : 'N/A';
        gameMapsObj.result = textManipulator.result.call(gameMapsObj, game);
        gameMapsObj.finalScore = textManipulator.finalScore.call(gameMapsObj, game);

        // gameMapsObj maps to a player
        return gameMapsObj;

      };

      /**
       * @description maps each game data in player details view
       */
      arrayMapper.gameMapper = function (game) {

        var gameMapsObj = {
          alignment: game.alignment === 'away' ? '@' : 'vs',
          vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
          goalsScored: game.goals || 0,
          leagueName: textManipulator.formattedLeagueName(game.box_score.event.league.slug),
          datePlayed: momentService.goalLogDate(game.box_score.event.game_date),
          //rawDatePlayed: $moment(game.box_score.event.game_date),
          originalDate: game.box_score.event.game_date,
          result: textManipulator.result.call(gameMapsObj, game),
          finalScore: textManipulator.finalScore.call(gameMapsObj, game)
        };

        return gameMapsObj;

      };

      return arrayMapper;

    });

})();
