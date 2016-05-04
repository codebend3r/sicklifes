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

        p.player = {
          id: result.data.id,
          name: textManipulator.formattedFullName(result.data.first_name, result.data.last_name),
          status: p.player.status,
          image: result.data.headshots.w192xh192,
          pickNumber: p.player.pickNumber
        };

        if (angular.isUndefinedOrNull(p.player)) {
          $log.warn('no p.player property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.id)) {
          $log.warn('no p.player.name property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.name)) {
          $log.warn('no p.player.name property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.status)) {
          $log.warn('no p.player.status property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.image)) {
          $log.warn('no p.player.image property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.player.pickNumber)) {
          $log.warn('no p.player.pickNumber property', p);
          debugger;
        }

        p.league = p.league || {};
        !angular.isUndefinedOrNull(p.league.leagueName) && (p.league.name = p.league.leagueName);
        !angular.isUndefinedOrNull(p.league.leagueSlugs) && (p.league.slugs = p.league.leagueSlugs);

        !angular.isUndefinedOrNull(p.league.leagueName) && (delete p.league.leagueName);
        !angular.isUndefinedOrNull(p.league.leagueSlugs) && (delete p.league.leagueSlugs);

        var profileLeagueSlug;

        if (!angular.isUndefinedOrNull(p.active) && p.active === false) {
          //$log.debug('league slug for inactive player', p);
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
          $log.warn('no p.team property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.team.id)) {
          $log.warn('no p.team.id property', p);
          debugger;
        }

        if (angular.isUndefinedOrNull(p.team.name)) {
          $log.warn('no p.team.name property', p);
          debugger;
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
          p = dataObj.player || null,
          manager = dataObj.manager || null,
          validLeagues,
          allPromises = [],
          ligaGamesRequest,
          eplGamesRequest,
          seriGamesRequest,
          chlgGamesRequest,
          euroGamesRequest;


        validLeagues = p.validLeagues || {};
        // p = objectUtils.playerResetGoalPoints(p);
        p.stats = {};
        p.stats.goals = 0;
        p.stats.assists = 0;
        p.stats.points = 0;
        p.stats.domesticGoals = 0;
        p.stats.clGoals = 0;
        p.stats.eGoals = 0;
        p.stats.shots = 0;
        p.stats.shotsOnGoal = 0;

        // reset slugs
        p.league.slugs = '';

        !angular.isUndefinedOrNull(manager) && angular.isUndefinedOrNull(manager.monthlyGoalsLog) && (manager.monthlyGoalsLog = []);
        !angular.isUndefinedOrNull(manager) && angular.isUndefinedOrNull(manager.filteredMonthlyGoalsLog) && (manager.filteredMonthlyGoalsLog = []);

        if (validLeagues.inLiga) {

          // LA LIGA
          ligaGamesRequest = apiFactory.getPlayerLog('liga', p.player.id);
          ligaGamesRequest.then(function (result) {

            p.gameLogs.ligaCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: p,
                manager: manager
              }))
              .filter(arrayFilter.filterAfterDate);

            p.gameLogs.ligaFilteredGameLog = p.gameLogs.ligaCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, p))
              .map(arrayMapper.computedPoints.bind(this, {
                player: p,
                manager: manager
              }));

            //p.league.name = 'LIGA';
            var foundTeam = _.where($rootScope.leagueTables.liga, {teamName: p.team.name});
            if (p.status !== 'dropped' && (foundTeam.length || p.gameLogs.ligaCompleteLog.length)) {
              p.activeLeagues.playedInLigaGames = true;
              p.league.name = 'LIGA';
              p.league.slugs += p.league.slugs.length === 0 ? 'liga' : '/liga';
              if (!angular.isUndefinedOrNull(manager)) {
                if (p.activeLeagues.playedInLigaGames && p.status !== 'dropped') manager.ligaCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(p.gameLogs.ligaCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(p.gameLogs.ligaFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (p.gameLogs.ligaCompleteLog.length === 0) {
              delete p.gameLogs.ligaCompleteLog;
              delete p.gameLogs.ligaFilteredGameLog;
            }

          }, function () {
            $log.debug('LIGA failed', p.player.name);
          });

          allPromises.push(ligaGamesRequest);

        }

        if (validLeagues.inEPL) {

          // EPL
          eplGamesRequest = apiFactory.getPlayerLog('epl', p.player.id);
          eplGamesRequest.then(function (result) {

            // if (angular.isUndefinedOrNull(result.data)) {
            //   debugger;
            // }

            p.gameLogs.eplCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: p,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            p.gameLogs.eplFilteredGameLog = p.gameLogs.eplCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, p))
              .map(arrayMapper.computedPoints.bind(this, {
                player: p,
                manager: manager
              }));

            // p.league.name = 'EPL';
            var foundTeam = _.where($rootScope.leagueTables.epl, {teamName: p.team.name});
            if (p.status !== 'dropped' && (foundTeam.length || p.gameLogs.eplCompleteLog.length)) {
              p.activeLeagues.playedInEPLGames = true;
              p.league.name = 'EPL';
              p.league.slugs += p.league.slugs.length === 0 ? 'epl' : '/epl';
              if (!angular.isUndefinedOrNull(manager)) {
                if (p.activeLeagues.playedInEPLGames && p.status !== 'dropped') manager.eplCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(p.gameLogs.eplCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(p.gameLogs.eplFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (p.gameLogs.eplCompleteLog.length === 0) {
              delete p.gameLogs.eplCompleteLog;
              delete p.gameLogs.eplFilteredGameLog;
            }

          }, function () {
            $log.debug('EPL failed', p.player.name);
          });

          allPromises.push(eplGamesRequest);

        }

        if (validLeagues.inSeri) {

          // SERIE A
          seriGamesRequest = apiFactory.getPlayerLog('seri', p.player.id);
          seriGamesRequest.then(function (result) {

            if (angular.isUndefinedOrNull(result.data)) {
              debugger;
            }

            // result.data
            //   .forEach(function (gameData) {
            //     _.each(statsCorrection.events.seri, function (game) {
            //       if (p.player.id === game.playerId && gameData.id === game.gameId) {
            //         gameData[game.statType] = game.goals;
            //       }
            //     });
            //   });

            p.gameLogs.seriCompleteLog = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: p,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            p.gameLogs.seriFilteredGameLog = p.gameLogs.seriCompleteLog
              .filter(arrayFilter.filterOnValidGoals.bind(this, p))
              .map(arrayMapper.computedPoints.bind(this, {
                player: p,
                manager: manager
              }));

            // p.league.name = 'SERI';
            var foundTeam = _.where($rootScope.leagueTables.seri, {teamName: p.team.name});
            if (p.status !== 'dropped' && (foundTeam.length || p.gameLogs.seriCompleteLog.length)) {
              p.activeLeagues.playedInSeriGames = true;
              p.league.name = 'SERI';
              p.league.slugs += p.league.slugs.length === 0 ? 'seri' : '/seri';
              if (!angular.isUndefinedOrNull(manager)) {
                if (p.activeLeagues.playedInSeriGames && p.status !== 'dropped') manager.seriCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(p.gameLogs.seriCompleteLog).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(p.gameLogs.seriFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (p.gameLogs.seriCompleteLog.length === 0) {
              delete p.gameLogs.seriCompleteLog;
              delete p.gameLogs.seriFilteredGameLog;
            }

          }, function () {
            $log.debug('EPL failed', p.player.name);
          });

          allPromises.push(seriGamesRequest);

        }

        if (validLeagues.inChlg) {

          // CHAMPIONS LEAGUE

          chlgGamesRequest = apiFactory.getPlayerLog('chlg', p.player.id);
          chlgGamesRequest.then(function (result) {

            if (angular.isUndefinedOrNull(result.data)) {
              debugger;
            }

            p.gameLogs.chlgCompleteLogs = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: p,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            p.gameLogs.chlgFilteredGameLog = p.gameLogs.chlgCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, p))
              .map(arrayMapper.computedPoints.bind(this, {
                player: p,
                manager: manager
              }));

            var foundTeam = _.where($rootScope.leagueTables.chlg, {teamName: p.team.name});
            if (foundTeam && angular.isUndefinedOrNull(validLeagues.inSeri) && angular.isUndefinedOrNull(validLeagues.inLiga) && angular.isUndefinedOrNull(validLeagues.inEPL)) {
              p.league.name = 'CHLG';
            }
            if (p.status !== 'dropped' && (foundTeam.length || p.gameLogs.chlgCompleteLogs.length)) {
              p.activeLeagues.playedInChlgGames = true;
              p.league.slugs += p.league.slugs.length === 0 ? 'chlg' : '/chlg';
              p.league.tournamentName = textManipulator.formattedLeagueName('chlg');
              if (!angular.isUndefinedOrNull(manager)) {
                if (p.activeLeagues.playedInChlgGames) manager.chlgCount += 1;
                manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(p.gameLogs.chlgCompleteLogs).filter(arrayFilter.filterOutUndefined);
                manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(p.gameLogs.chlgFilteredGameLog).filter(arrayFilter.filterOutUndefined);
              }
            } else if (p.gameLogs.chlgCompleteLogs.length === 0) {
              delete p.gameLogs.chlgCompleteLogs;
              delete p.gameLogs.chlgFilteredGameLog;
            }

          }, function () {
            $log.debug('CHLG failed', p.player.name);
          });

          allPromises.push(chlgGamesRequest);

        }

        if (validLeagues.inEuro) {

          // EUROPA LEAGUE

          euroGamesRequest = apiFactory.getPlayerLog('uefa', p.player.id);

          euroGamesRequest.then(function (result) {

            p.gameLogs.euroCompleteLogs = result.data
              .filter(arrayFilter.filterOutUndefined)
              .map(arrayMapper.gameLogMapper.bind(this, {
                player: p,
                manager: manager || null
              }))
              .filter(arrayFilter.filterAfterDate);

            p.gameLogs.euroFilteredGameLog = p.gameLogs.euroCompleteLogs
              .filter(arrayFilter.filterOnValidGoals.bind(this, p))
              .map(arrayMapper.computedPoints.bind(this, {
                player: p,
                manager: manager
              }));

            var foundTeam = _.where($rootScope.leagueTables.uefa, {teamName: p.team.name});
            if (foundTeam && _.keys(validLeagues) === ['inEuro']) {
              p.league.name = 'EURO';
            }
            if (p.status !== 'dropped' && (foundTeam.length || p.gameLogs.euroCompleteLogs.length)) {
              p.activeLeagues.playedInEuroGames = true;
              p.league.slugs += p.league.slugs.length === 0 ? 'euro' : '/euro';
              p.league.tournamentName = textManipulator.formattedLeagueName('uefa');
            } else if (p.gameLogs.euroCompleteLogs.length === 0) {
              delete p.gameLogs.euroCompleteLogs;
              delete p.gameLogs.euroFilteredGameLog;
            }

            if (!angular.isUndefinedOrNull(manager)) {
              if (p.activeLeagues.playedInEuroGames) manager.euroCount += 1;
              manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(p.gameLogs.euroCompleteLogs).filter(arrayFilter.filterOutUndefined);
              manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(p.gameLogs.euroFilteredGameLog).filter(arrayFilter.filterOutUndefined);
            }

          }, function () {
            $log.debug('EURO failed', p.player.name);
          });

          allPromises.push(euroGamesRequest);

        }

        $q.all(allPromises).then(function () {
          deferred.resolve(p);
        }, function () {
          $log.debug('FAIL');
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
