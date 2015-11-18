/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $objectUtils, $momentService, $arrayLoopers, $arrayFilter, $apiFactory, $rootScope) {

      var arrayMapper = {};

      /**
       * maps each player's stats
       * @param managersData
       * @param url
       * @param i
       */
      arrayMapper.goalsMap = function (managersData, url, i) {

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
          teamName: $textManipulator.teamNameFormatted(teamData.team.full_name),
          points: teamData.points
        };

      };

      /**
       * maps league table data for epl, seri, and la liga
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
      arrayMapper.playerInfo = function (player, result) {

        var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

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
        player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

        // based on player result data return an object with the valid leagues for this player
        player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

        return $apiFactory.getPlayerProfile(profileLeagueSlug, player.id);

      };

      /**
       * @description forEach function - loops through soccer roster
       * @param player - player object
       * @param result
       */
      arrayMapper.playerMapPersonalInfo = function (player, result) {

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

        if (validLeagues.inLiga) {

          // LA LIGA

          ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id);

          ligaGamesRequest.then(function (result) {

            player.ligaCompleteLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.ligaFilteredGameLog = player.ligaCompleteLog
              .filter($arrayFilter.filterOnValidGoals.bind(this, player));

            var foundTeam = _.where($rootScope.leagueTables.liga, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.ligaCompleteLog.length)) {
              player.playedInLigaGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'liga' : '/liga';
              player.leagueName = 'LA LIGA';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInLigaGames) manager.ligaCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.ligaCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.ligaFilteredGameLog);
            }


          });

          allPromises.push(ligaGamesRequest);

        }

        if (validLeagues.inEPL) {

          // EPL

          eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id);

          eplGamesRequest.then(function (result) {

            player.eplCompleteLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.eplFilteredGameLog = player.eplCompleteLog
              .filter($arrayFilter.filterOnValidGoals.bind(this, player));

            var foundTeam = _.where($rootScope.leagueTables.epl, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.eplCompleteLog.length)) {
              player.playedInEPLGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'epl' : '/epl';
              player.leagueName = 'EPL';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInEPLGames) manager.eplCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.eplCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.eplFilteredGameLog);
            }


          });

          allPromises.push(eplGamesRequest);

        }

        if (validLeagues.inSeri) {

          // SERIE A

          seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id);

          seriGamesRequest.then(function (result) {

            player.seriCompleteLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.seriFilteredGameLog = player.seriCompleteLog
              .filter($arrayFilter.filterOnValidGoals.bind(this, player));

            var foundTeam = _.where($rootScope.leagueTables.seri, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.seriCompleteLog.length)) {
              player.playedInSeriGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'seri' : '/seri';
              player.leagueName = 'SERIE A';
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.playedInSeriGames) manager.seriCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.seriCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.seriFilteredGameLog);
            }


          });

          allPromises.push(seriGamesRequest);

        }

        if (validLeagues.inChlg) {

          // CHAMPIONS LEAGUE

          chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id);
          chlgGamesRequest.then(function (result) {

            player.chlgCompleteLogs = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.chlgFilteredGameLog = player.chlgCompleteLogs
              .filter($arrayFilter.filterOnValidGoals.bind(this, player));

            var foundTeam = _.where($rootScope.leagueTables.chlg, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.chlgCompleteLogs.length)) {
              player.playedInChlgGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'chlg' : '/chlg';
              player.tournamentLeagueName = $textManipulator.formattedLeagueName('chlg');
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

          euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

          euroGamesRequest.then(function (result) {

            player.euroCompleteLogs = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMapper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.euroFilteredGameLog = player.euroCompleteLogs
              .filter($arrayFilter.filterOnValidGoals.bind(this, player));

            var foundTeam = _.where($rootScope.leagueTables.uefa, { teamName: player.teamName });
            if (player.status !== 'dropped' && (foundTeam.length || player.euroCompleteLogs.length)) {
              player.playedInEuroGames = true;
              player.leagueSlugs += player.leagueSlugs.length === 0 ? 'euro' : '/euro';
              player.tournamentLeagueName = $textManipulator.formattedLeagueName('uefa');
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
          playerName: $textManipulator.formattedFullName(i.first_name, i.last_name),
          managerName: $rootScope.draftMode ? 'Free Agent' : arrayMapper.getOwnerByID(i.id),
          teamName: $textManipulator.teamNameFormatted(teamData.full_name),
          teamLogo: teamData.logos.small,
          leagueName: $textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase()
        };

      };

      /**
       * called by playerGamesLog
       */
      arrayMapper.monthlyMapper = function (dataObj, game, index) {

        var gameMapsObj = {},
          gameGoals,
          leagueSlug,
          computedPoints;

        gameMapsObj.index = index;
        gameMapsObj.id = dataObj.player.id;
        gameMapsObj.playerName = $textManipulator.stripVowelAccent(dataObj.player.playerName);
        gameMapsObj.alignment = game.alignment === 'away' ? '@' : 'vs';
        gameMapsObj.vsTeam = game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name;
        gameMapsObj.leagueSlug = game.box_score.event.league.slug;
        gameMapsObj.goalsScored = game.goals || 0;
        gameMapsObj.points = $scoringLogic.calculatePoints(gameMapsObj.goalsScored, gameMapsObj.leagueSlug) || $scoringLogic.calculatePoints(0, gameMapsObj.leagueSlug);
        gameMapsObj.assists = game.assists || 0;
        gameMapsObj.shots = game.shots || 0;
        gameMapsObj.shotsOnGoal = game.shots_on_goal || 0;
        gameMapsObj.minutesPlayed = game.minutes_played || 0;
        gameMapsObj.teamName = dataObj.player.teamName;
        gameMapsObj.teamLogo = dataObj.player.teamLogo;
        gameMapsObj.datePlayed = $momentService.goalLogDate(game.box_score.event.game_date);
        gameMapsObj.originalDate = game.box_score.event.game_date;
        gameMapsObj.managerName = dataObj.player.managerName || 'N/A';
        gameMapsObj.result = $textManipulator.result.call(gameMapsObj, game);
        gameMapsObj.finalScore = $textManipulator.finalScore.call(gameMapsObj, game);

        // console.log('================================');
        // console.log(gameMapsObj.playerName, 'goals', gameMapsObj.goalsScored);
        // console.log(gameMapsObj.playerName, 'assists', gameMapsObj.assists);
        // console.log(gameMapsObj.playerName, 'shots', gameMapsObj.shots);
        // console.log(gameMapsObj.playerName, 'shots on goals', gameMapsObj.shotsOnGoal);
        // console.log(gameMapsObj.playerName, 'minutes played', gameMapsObj.minutesPlayed);
        // console.log(gameMapsObj.playerName, 'datePlayed', gameMapsObj.datePlayed);
        // console.log(gameMapsObj.playerName, 'vsTeam', gameMapsObj.vsTeam);

        gameGoals = gameMapsObj.goalsScored;
        leagueSlug = gameMapsObj.leagueSlug;

        if ($textManipulator.acceptedLeague(leagueSlug)) {

          computedPoints = $scoringLogic.calculatePoints(gameGoals, leagueSlug);

          if ($textManipulator.isDomesticLeague(leagueSlug)) {

            if (dataObj.player) dataObj.player.domesticGoals += gameGoals;
            if (dataObj.manager) dataObj.manager.domesticGoals += gameGoals;

          } else if ($textManipulator.isChampionsLeague(leagueSlug)) {

            if (dataObj.player) dataObj.player.clGoals += gameGoals;
            if (dataObj.manager) dataObj.manager.clGoals += gameGoals;

          } else if ($textManipulator.isEuropaLeague(leagueSlug)) {

            if (dataObj.player) dataObj.player.eGoals += gameGoals;
            if (dataObj.manager) dataObj.manager.eGoals += gameGoals;

          }

          // increment goals for each player
          if (dataObj.player) dataObj.player.goals += gameGoals;

          // increment goals for the manager
          if (dataObj.manager) dataObj.manager.totalGoals += gameGoals;

          // increment points
          if (dataObj.player) {
            dataObj.player.points += computedPoints;
          }
          if (dataObj.manager) dataObj.manager.totalPoints += computedPoints;

        }

        if (dataObj.player) dataObj.player.assists += game.assists;

        // gameMapsObj maps to a player
        return gameMapsObj;

      };

      /**
       * maps each game data in player details view
       */
      arrayMapper.gameMapper = function (game) {

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

      return arrayMapper;

    });

})();
