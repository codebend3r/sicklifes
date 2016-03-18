/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('arrayMappers', function ($rootScope, $q, textManipulator, managersService, scoringLogic, objectUtils, momentService, arrayFilter, apiFactory, statsCorrection, transferDates) {

      var arrayMapper = {};

      /**
       * @description maps each player's stats
       * @param managerData
       * @param url
       * @param i
       */
      arrayMapper.goalsMap = function (managerData, url, i) {

        return {
          id: i.player.id,
          url: url || '',
          rank: i.ranking,
          playerName: textManipulator.formattedFullName(i.player.first_name, i.player.last_name),
          teamName: textManipulator.teamNameFormatted(i.team.full_name),
          domesticGoals: 0,
          leagueGoals: 0,
          goals: i.stat,
          managerName: arrayLoopers.getOwnerByID(managerData, i.player.id),
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
      arrayMapper.playerInfo = function (p, result) {

        p.activeLeagues = {
          playedInLigaGames: false,
          playedInEPLGames: false,
          playedInSeriGames: false,
          playedInChlgGames: false,
          playedInEuroGames: false
        };

        if (p.status === 'drafted') {
          p.dateOfTransaction = transferDates.leagueStart.date;
        }

        // reset assists
        p.stats = {
          domesticGoals: 0,
          clGoals: 0,
          eGoals: 0,
          assists: 0,
          shots: 0,
          shotsOnGoal: 0,
          goals: 0,
          points: 0
        };

        if (angular.isUndefinedOrNull(result.data.headshots.w192xh192)) {
          debugger;
        }

        p.player = {
          id: result.data.id,
          name: textManipulator.formattedFullName(result.data.first_name, result.data.last_name),
          status: p.player.status,
          image: result.data.headshots.w192xh192,
          pickNumber: p.player.pickNumber
        };

        if (angular.isUndefinedOrNull(p.player)) {
          console.warn('no p.player property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.id)) {
          console.warn('no p.player.name property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.name)) {
          console.warn('no p.player.name property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.status)) {
          console.warn('no p.player.status property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.image)) {
          console.warn('no p.player.image property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.pickNumber)) {
          console.warn('no p.player.pickNumber property', p);
          debugger;
        }

        p.league = p.league || {};
        !angular.isUndefinedOrNull(p.league.leagueName) && (p.league.name = p.league.leagueName);
        !angular.isUndefinedOrNull(p.league.leagueSlugs) && (p.league.slugs = p.league.leagueSlugs);

        !angular.isUndefinedOrNull(p.league.leagueName) && (delete p.league.leagueName);
        !angular.isUndefinedOrNull(p.league.leagueSlugs) && (delete p.league.leagueSlugs);

        var profileLeagueSlug;

        if (!angular.isUndefinedOrNull(p.active) && p.active === false) {
          //console.log('league slug for inactive player', p);
          profileLeagueSlug = p.league.name;
        } else {
          profileLeagueSlug = p.league.name;
          //profileLeagueSlug = textManipulator.getLeagueSlug(result);
        }

        if (angular.isUndefinedOrNull(profileLeagueSlug)) {
          debugger;
        }

        // returns a concat string with all valid leagues
        p.allLeaguesName = textManipulator.validLeagueNamesFormatted(result);

        // based on player result data return an object with the valid leagues for this player
        p.validLeagues = textManipulator.getPlayerValidLeagues(result);

        return apiFactory.getPlayerProfile(profileLeagueSlug, p.player.id);

      };

      /**
       * @name playerMapPersonalInfo
       * @description forEach function - loops through soccer roster
       * @param player - player object
       * @param result
       */
      arrayMapper.playerMapPersonalInfo = function (p, result) {

        p.bio = {
          position: result.data.position,
          pos: result.data.position_abbreviation,
          weight: result.data.weight,
          height: result.data.height_feet + '\'' + result.data.height_inches,
          birthdate: result.data.birthdate,
          birthplace: result.data.birth_city + ', ' + result.data.birth_country
        };

        p.team = p.team || {};

        p.team.id = result.data.team && result.data.team.id || p.team.id || '';
        p.team.name = result.data.team && result.data.team.full_name || p.team.name || '';
        p.team.logo = result.data.team && result.data.team.logos.large || p.team.logo;

        if (angular.isUndefinedOrNull(p.team)) {
          console.warn('no p.team property', p);
        }

        if (angular.isUndefinedOrNull(p.team.id)) {
          console.warn('no p.team.id property', p);
        }

        if (angular.isUndefinedOrNull(p.team.name)) {
          console.warn('no p.team.name property', p);
        }

        // if (angular.isUndefinedOrNull(managersService.findPlayerInManagers(p.player.id).manager)) {
        //   p.status = 'free agent';
        // } else {
        //   //player.status = managersService.findPlayerInManagers(player.id).player.status;
        //   p.status = p.status;
        // }

      };

      /**
       * @name playerGamesLog
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

        // reset slugs
        player.league.slugs = '';

        !angular.isUndefinedOrNull(manager) && angular.isUndefinedOrNull(manager.monthlyGoalsLog) && (manager.monthlyGoalsLog = []);
        !angular.isUndefinedOrNull(manager) && angular.isUndefinedOrNull(manager.filteredMonthlyGoalsLog) && (manager.filteredMonthlyGoalsLog = []);

        player.gameLogs = {};

        if (validLeagues.inLiga) {

          // LA LIGA
          ligaGamesRequest = apiFactory.getPlayerLog('liga', player.player.id);
          ligaGamesRequest.then(function (result) {

            player.gameLogs.ligaCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: player,
                manager: manager
              }))
              .filter(arrayFilter.filterAfterDate);

            player.gameLogs.ligaFilteredGameLog = player.gameLogs.ligaCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMapper.computedPoints.bind(this, {
                player: player,
                manager: manager
              }));

            //player.league.name = 'LIGA';
            var foundTeam = _.where($rootScope.leagueTables.liga, {teamName: player.teamName});
            if (player.status !== 'dropped' && (foundTeam.length || player.gameLogs.ligaCompleteLog.length)) {
              player.activeLeagues.playedInLigaGames = true;
              player.league.name = 'LIGA';
              player.league.slugs += player.league.slugs.length === 0 ? 'liga' : '/liga';
              if (!angular.isUndefinedOrNull(manager)) {
                if (player.activeLeagues.playedInLigaGames && player.status !== 'dropped') manager.ligaCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.gameLogs.ligaCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.gameLogs.ligaFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (player.gameLogs.ligaCompleteLog.length === 0) {
              delete player.gameLogs.ligaCompleteLog;
              delete player.gameLogs.ligaFilteredGameLog;
            }

          }, function () {
            console.log('LIGA failed', player.playerName);
          });

          allPromises.push(ligaGamesRequest);

        }

        if (validLeagues.inEPL) {

          // EPL
          eplGamesRequest = apiFactory.getPlayerLog('epl', player.player.id);
          eplGamesRequest.then(function (result) {

            if (angular.isUndefinedOrNull(result.data)) {
              debugger;
            }

            player.gameLogs.eplCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.gameLogs.eplFilteredGameLog = player.gameLogs.eplCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMapper.computedPoints.bind(this, {
                player: player,
                manager: manager
              }));

            // player.league.name = 'EPL';
            var foundTeam = _.where($rootScope.leagueTables.epl, {teamName: player.teamName});
            if (player.status !== 'dropped' && (foundTeam.length || player.gameLogs.eplCompleteLog.length)) {
              player.activeLeagues.playedInEPLGames = true;
              player.league.name = 'EPL';
              player.league.slugs += player.league.slugs.length === 0 ? 'epl' : '/epl';
              if (!angular.isUndefinedOrNull(manager)) {
                if (player.activeLeagues.playedInEPLGames && player.status !== 'dropped') manager.eplCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.gameLogs.eplCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.gameLogs.eplFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (player.gameLogs.eplCompleteLog.length === 0) {
              delete player.gameLogs.eplCompleteLog;
              delete player.gameLogs.eplFilteredGameLog;
            }

          }, function () {
            console.log('EPL failed', player.playerName);
          });

          allPromises.push(eplGamesRequest);

        }

        if (validLeagues.inSeri) {

          // SERIE A
          seriGamesRequest = apiFactory.getPlayerLog('seri', player.player.id);
          seriGamesRequest.then(function (result) {

            if (angular.isUndefinedOrNull(result.data)) {
              debugger;
            }

            // result.data
            //   .forEach(function (gameData) {
            //     _.each(statsCorrection.events.seri, function (game) {
            //       if (player.player.id === game.playerId && gameData.id === game.gameId) {
            //         gameData[game.statType] = game.goals;
            //       }
            //     });
            //   });

            player.gameLogs.seriCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.gameLogs.seriFilteredGameLog = player.gameLogs.seriCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMapper.computedPoints.bind(this, {
                player: player,
                manager: manager
              }));

            // player.league.name = 'SERI';
            var foundTeam = _.where($rootScope.leagueTables.seri, {teamName: player.teamName});
            if (player.status !== 'dropped' && (foundTeam.length || player.gameLogs.seriCompleteLog.length)) {
              player.activeLeagues.playedInSeriGames = true;
              player.league.name = 'SERI';
              player.league.slugs += player.league.slugs.length === 0 ? 'seri' : '/seri';
              if (!angular.isUndefinedOrNull(manager)) {
                if (player.activeLeagues.playedInSeriGames && player.status !== 'dropped') manager.seriCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.gameLogs.seriCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.gameLogs.seriFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (player.gameLogs.seriCompleteLog.length === 0) {
              delete player.gameLogs.seriCompleteLog;
              delete player.gameLogs.seriFilteredGameLog;
            }

          }, function () {
            console.log('EPL failed', player.playerName);
          });

          allPromises.push(seriGamesRequest);

        }

        if (validLeagues.inChlg) {

          // CHAMPIONS LEAGUE

          chlgGamesRequest = apiFactory.getPlayerLog('chlg', player.player.id);
          chlgGamesRequest.then(function (result) {

            if (angular.isUndefinedOrNull(result.data)) {
              debugger;
            }

            player.gameLogs.chlgCompleteLogs = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.gameLogs.chlgFilteredGameLog = player.gameLogs.chlgCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMapper.computedPoints.bind(this, {
                player: player,
                manager: manager
              }));

            var foundTeam = _.where($rootScope.leagueTables.chlg, {teamName: player.teamName});
            if (foundTeam && angular.isUndefinedOrNull(validLeagues.inSeri) && angular.isUndefinedOrNull(validLeagues.inLiga) && angular.isUndefinedOrNull(validLeagues.inEPL)) {
              player.league.name = 'CHLG';
            }
            if (player.status !== 'dropped' && (foundTeam.length || player.gameLogs.chlgCompleteLogs.length)) {
              player.activeLeagues.playedInChlgGames = true;
              player.league.slugs += player.league.slugs.length === 0 ? 'chlg' : '/chlg';
              player.league.tournamentName = textManipulator.formattedLeagueName('chlg');
              if (!angular.isUndefinedOrNull(manager)) {
                if (player.activeLeagues.playedInChlgGames) manager.chlgCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.gameLogs.chlgCompleteLogs).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.gameLogs.chlgFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (player.gameLogs.chlgCompleteLogs.length === 0) {
              delete player.gameLogs.chlgCompleteLogs;
              delete player.gameLogs.chlgFilteredGameLog;
            }

          }, function () {
            console.log('CHLG failed', player.playerName);
          });

          allPromises.push(chlgGamesRequest);

        }

        if (validLeagues.inEuro) {

          // EUROPA LEAGUE

          euroGamesRequest = apiFactory.getPlayerLog('uefa', player.player.id);

          euroGamesRequest.then(function (result) {

            player.gameLogs.euroCompleteLogs = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: player,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            player.gameLogs.euroFilteredGameLog = player.gameLogs.euroCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, player))
              .map(arrayMapper.computedPoints.bind(this, {
                player: player,
                manager: manager
              }));

            var foundTeam = _.where($rootScope.leagueTables.uefa, {teamName: player.teamName});
            if (foundTeam && _.keys(validLeagues) === ['inEuro']) {
              player.league.name = 'EURO';
            }
            if (player.status !== 'dropped' && (foundTeam.length || player.gameLogs.euroCompleteLogs.length)) {
              player.activeLeagues.playedInEuroGames = true;
              player.league.slugs += player.league.slugs.length === 0 ? 'euro' : '/euro';
              player.league.tournamentName = textManipulator.formattedLeagueName('uefa');
            } else if (player.gameLogs.euroCompleteLogs.length === 0) {
              delete player.gameLogs.euroCompleteLogs;
              delete player.gameLogs.euroFilteredGameLog;
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (player.activeLeagues.playedInEuroGames) manager.euroCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(player.gameLogs.euroCompleteLogs).filter(arrayFilter.filterOutUndefined);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(player.gameLogs.euroFilteredGameLog).filter(arrayFilter.filterOutUndefined);
            }

          }, function () {
            console.log('EURO failed', player.playerName);
          });

          allPromises.push(euroGamesRequest);

        }

        $q.all(allPromises).then(function () {
          deferred.resolve(player);
        }, function () {
          console.log('FAIL');
        });

        return deferred.promise;

      };

      /**
       * @name getOwnerByID
       * @description loops through all managers roster and finds owner by player id
       */
      arrayMapper.getOwnerByID = function (id) {

        var owner = 'Free Agent';

        _.some($rootScope.managerData.data, function (m) {
          _.some(m.players, function (p) {
            if (p.id === id) {
              owner = m.manager.name;
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
       * @param result
       * @param index
       * @returns {{index: *, id: *, playerName: *, managerName: *, teamName: string, leagueName: string}}
       */
      arrayMapper.transferPlayersMap = function (leagueData, teamData, result, index) {

        var obj = {};

        obj.player = {
          id: result.id,
          name: textManipulator.formattedFullName(result.first_name, result.last_name)
        };

        obj.manager =  {
          name: $rootScope.draftMode ? 'Free Agent' : arrayMapper.getOwnerByID(result.id)
        };

        obj.league =  {
          name: leagueData.slug.toUpperCase()
        };

        obj.team = {
          id: teamData.id,
          name: textManipulator.teamNameFormatted(teamData.full_name),
          logo: teamData.logos.small,
        };

        var match = managersService.findPlayerInManagers(result.id);

        if (!angular.isUndefinedOrNull(match.player)) {
          obj.player.status = match.player.status;
        } else {
          obj.player.status = 'free agent';
        }

        if (!angular.isUndefinedOrNull(match.manager)) {
          obj.manager.name = match.manager.managerName;
        } else {
          obj.manager.name = '';
        }

        return obj;

      };

      /**
       * @name computedPoints
       * @description takes previous built object
       * @param dataObj
       * @param game
       */
      arrayMapper.computedPoints = function (dataObj, game) {

        var points;
        var player = dataObj.player;
        var manager = dataObj.manager;

        if (textManipulator.acceptedLeague(game.leagueSlug)) {

          points = scoringLogic.calculatePoints(game.goals, game.leagueSlug, game.datePlayed);

          if (textManipulator.isDomesticLeague(game.leagueSlug)) {

            // is in domestic league
            player.stats.domesticGoals += game.goals;
            if (!angular.isUndefinedOrNull(manager)) manager.domesticGoals += game.goals;

          } else if (textManipulator.isChampionsLeague(game.leagueSlug)) {

            // is in champions league
            player.stats.clGoals += game.goals;
            if (!angular.isUndefinedOrNull(manager)) manager.clGoals += game.goals;

          } else if (textManipulator.isEuropaLeague(game.leagueSlug)) {

            // is in europa league
            player.stats.eGoals += game.goals;
            if (!angular.isUndefinedOrNull(manager)) manager.eGoals += game.goals;

          }

          // increment goals for each player
          player.stats.goals += game.goals;

          // increment goals for the manager
          if (!angular.isUndefinedOrNull(manager)) manager.totalGoals += game.goals;

          // increment points
          player.stats.points += points;

          // manager total points
          if (!angular.isUndefinedOrNull(manager)) manager.totalPoints += points;

        }

        player.stats.assists += game.assists;
        player.stats.shots += game.shots;
        player.stats.shotsOnGoal += game.shotsOnGoal;

        if (!angular.isUndefinedOrNull(manager)) {
          angular.isUndefinedOrNull(manager.charts) && (manager.charts = []);
          manager.charts.push({
            points: manager.totalPoints,
            goals: manager.totalGoals,
            stepPoints: points,
            stepAssists: game.assists,
            stepGoals: game.goals,
            stepShots: game.shots,
            stepShotsOnGoal: game.shotsOnGoal,
            date: game.datePlayed
          });
        }

        return game;

      };

      /**
       * @name gameLogMapper
       * @description called by playerGamesLog map function, builds the object per each player
       */
      arrayMapper.gameLogMapper = function (dataObj, game, index) {

        var gameMapsObj = {};

        gameMapsObj.index = index;
        gameMapsObj.id = dataObj.player.player.id;
        gameMapsObj.playerName = dataObj.player.player.name;
        gameMapsObj.alignment = game.alignment === 'away' ? '@' : 'vs';
        gameMapsObj.vsTeam = game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name;
        gameMapsObj.leagueSlug = game.box_score.event.league.slug;
        gameMapsObj.goals = game.goals || 0;
        gameMapsObj.points = 0;
        gameMapsObj.assists = game.assists || 0;
        gameMapsObj.shots = game.shots || 0;
        gameMapsObj.shotsOnGoal = game.shots_on_goal || 0;
        gameMapsObj.minutesPlayed = game.minutes_played || 0;
        gameMapsObj.teamName = game.team.full_name;
        gameMapsObj.teamId = dataObj.player.team.id;
        gameMapsObj.teamLogo = dataObj.player.team.logo;
        gameMapsObj.datePlayed = momentService.goalLogDate(game.box_score.event.game_date);
        gameMapsObj.originalDate = game.box_score.event.game_date;
        //gameMapsObj.managerName = dataObj.manager ? dataObj.manager.managerName : 'N/A';
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
          goals: game.goals || 0,
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
