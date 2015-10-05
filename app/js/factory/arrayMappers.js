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

        console.log('playerInfo:', player.playerName);

        var profileLeagueSlug = $textManipulator.getLeagueSlug(result);

        player.id = result.data.id;

        player.playedInLigaGames = false;
        player.playedInEPLGames = false;
        player.playedInSeriGames = false;
        player.playedInChlgGames = false;
        player.playedInEuroGames = false;

        player.assists = 0;

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
       * @param player - player object
       * @param result
       */
      arrayMaper.playerMapPersonalInfo = function (player, result) {

        //console.log('playerMapPersonalInfo:', player.playerName);

        player.position = result.data.position;
        player.pos = result.data.position_abbreviation;
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

        //console.log('playerGamesLog:', dataObj.player.playerName);

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
              //.filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.ligaGameLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMaper.gameMapper);

            //console.log(player.playerName, '|', player.ligaCompleteLog);
            //console.log('LIGA ligaGameLog:', player.ligaGameLog);

            if (!angular.isUndefinedOrNull(manager)) {
              var foundTeam = _.where($rootScope.firebaseData.leagueTables.liga, { teamName: player.teamName });
              if (player.status !== 'dropped' && (foundTeam.length || player.ligaGameLog.length)) {
                //console.log('LIGA:', player.playerName);
                manager.ligaCount += 1;
                player.playedInLigaGames = true;
                player.leagueSlugs += player.leagueSlugs.length === 0 ? 'liga' : '/liga';
                player.leagueName = 'LA LIGA';
              }
              //manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.ligaCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.ligaCompleteLog);
            }

          });

          allPromises.push(ligaGamesRequest);

        }

        if (validLeagues.inEPL) {

          // EPL

          eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id);

          eplGamesRequest.then(function (result) {

            player.eplCompleteLog = result.data
              //.filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.eplGameLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMaper.gameMapper);

            if (!angular.isUndefinedOrNull(manager)) {
              var foundTeam = _.where($rootScope.firebaseData.leagueTables.epl, { teamName: player.teamName });
              if (player.status !== 'dropped' && (foundTeam.length || player.eplGameLog.length)) {
                //console.log('EPL:', player.playerName);
                manager.eplCount += 1;
                player.playedInEPLGames = true;
                player.leagueSlugs += player.leagueSlugs.length === 0 ? 'epl' : '/epl';
                player.leagueName = 'EPL';
              }
              //manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.eplCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.eplCompleteLog);
            }

          });

          allPromises.push(eplGamesRequest);

        }

        if (validLeagues.inSeri) {

          // SERIE A

          seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id);

          seriGamesRequest.then(function (result) {

            player.seriCompleteLog = result.data
              //.filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.seriGameLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMaper.gameMapper);

            if (!angular.isUndefinedOrNull(manager)) {
              var foundTeam = _.where($rootScope.firebaseData.leagueTables.seri, { teamName: player.teamName });
              if (player.status !== 'dropped' && (foundTeam.length || player.seriGameLog.length)) {
                //console.log('SERI:', player.playerName);
                manager.seriCount += 1;
                player.playedInSeriGames = true;
                player.leagueSlugs += player.leagueSlugs.length === 0 ? 'seri' : '/seri';
                player.leagueName = 'SERIE A';
              }
              //manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.seriCompleteLog);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.seriCompleteLog);
            }

          });

          allPromises.push(seriGamesRequest);

        }

        if (validLeagues.inChlg) {

          // CHAMPIONS LEAGUE

          chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id);
          chlgGamesRequest.then(function (result) {

            player.chlgCompleteLogs = result.data
              //.filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.chlgGameLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMaper.gameMapper);

            if (!angular.isUndefinedOrNull(manager)) {
              var foundTeam = _.where($rootScope.firebaseData.leagueTables.chlg, { teamName: player.teamName });
              //if (chlgLogs.length > 0 || $rootScope.firebaseData.leagueTables.chlg.indexOf(player.teamName) !== -1 || player.chlgGameLog.length > 0) {
              if (player.status !== 'dropped' && (foundTeam.length || player.chlgGameLog.length)) {
                manager.chlgCount += 1;
                player.playedInChlgGames = true;
                player.leagueSlugs += player.leagueSlugs.length === 0 ? 'chlg' : '/chlg';
                player.tournamentLeagueName = $textManipulator.formattedLeagueName('chlg');
              }
              //manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.chlgCompleteLogs);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.chlgCompleteLogs);
            }

          });

          allPromises.push(chlgGamesRequest);

        }

        if (validLeagues.inEuro) {

          // EUROPA LEAGUE

          euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

          euroGamesRequest.then(function (result) {

            player.euroCompleteLogs = result.data
              //.filter($arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMaper.monthlyMapper.bind(this, {
                player: player,
                manager: manager || null
              }));

            player.euroGameLog = result.data
              .filter($arrayFilter.filterAfterDate)
              .map(arrayMaper.gameMapper);

            if (!angular.isUndefinedOrNull(manager)) {
              //if (euroLogs.length > 0 || $rootScope.firebaseData.leagueTables.uefa.indexOf(player.teamName) !== -1 || player.euroGameLog.length > 0) {
              var foundTeam = _.where($rootScope.firebaseData.leagueTables.uefa, { teamName: player.teamName });
              if (player.status !== 'dropped' && (foundTeam.length || player.euroGameLog.length > 0)) {
                manager.euroCount += 1;
                player.playedInEuroGames = true;
                player.leagueSlugs += player.leagueSlugs.length === 0 ? 'euro' : '/euro';
                player.tournamentLeagueName = $textManipulator.formattedLeagueName('uefa');
              }
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.euroCompleteLogs);
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
          assists: game.assists || 0,
          teamName: dataObj.player.teamName,
          teamLogo: dataObj.player.teamLogo,
          leagueSlug: game.box_score.event.league.slug,
          datePlayed: $momentService.goalLogDate(game.box_score.event.game_date),
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

        //console.log('dataObj.player.assists:', dataObj.player.assists);
        //console.log('game.assists:', game.assists);

        //debugger;

        dataObj.player.assists += game.assists;

        //console.log(dataObj.player.playerName, '|', dataObj.player.assists);

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
