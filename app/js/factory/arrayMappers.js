/**
 * Updated by Bouse on 12/06/2014
 */

sicklifesFantasy.factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $arrayLoopers, $dateService, $arrayFilter, $apiFactory, $date) {

  var arrayMaper = {

    /**
     * maps each player's stats
     * @param allManagers
     * @param url
     * @param i
     */
    goalsMap: function (allManagers, url, i) {

      var playerInLeague = {
        id: i.player.id,
        url: url || '',
        rank: i.ranking,
        playerName: $textManipulator.formattedFullName(i.player.first_name, i.player.last_name),
        teamName: $textManipulator.stripVowelAccent(i.team.full_name.toUpperCase()),
        domesticGoals: 0,
        leagueGoals: 0,
        goals: i.stat,
        managerName: $arrayLoopers.getOwnerByID(allManagers, i.player.id),
        leagueName: $textManipulator.getLeagueByURL(url),
        transactionsLog: [],
        historyLog: []
      };

      return playerInLeague;

    },

    /**
     *
     * @param dataObj
     */
    playerGamesLog: function (dataObj) {

      var player = dataObj.player || null,
        manager = dataObj.manager || null;

      //////////////////////////////

      // based on player result data return an object with the valid leagues for this player
      var validLeagues = player.validLeagues,
        ligaGamesRequest = $apiFactory.getPlayerGameDetails('liga', player.id),
        eplGamesRequest = $apiFactory.getPlayerGameDetails('epl', player.id),
        seriGamesRequest = $apiFactory.getPlayerGameDetails('seri', player.id),
        chlgGamesRequest = $apiFactory.getPlayerGameDetails('chlg', player.id),
        euroGamesRequest = $apiFactory.getPlayerGameDetails('uefa', player.id);

      if (validLeagues.inLiga) {
        // if player is not dropped then count on active roster
        ligaGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this,
            {
              player: player,
              manager: manager || null
            }
          ));
          player.ligaGameLog = result.data.filter($arrayFilter.filterAfterDate).map(arrayMaper.gameMapper);
          player.domesticLeagueName = $textManipulator.formattedLeagueName('liga');
          if (manager) {
            if (player.status !== 'dropped') manager.ligaCount += 1;
            manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
            manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
          }
        });
      }

      if (validLeagues.inEPL) {
        // if player is not dropped then count on active roster
        eplGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this,
            {
              player: player,
              manager: manager || null
            }
          ));
          player.eplGameLog = result.data.filter($arrayFilter.filterAfterDate).map(arrayMaper.gameMapper);
          player.domesticLeagueName = $textManipulator.formattedLeagueName('epl');
          if (manager) {
            if (player.status !== 'dropped') manager.eplCount += 1;
            manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
            manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
          }
        });
      }

      if (validLeagues.inSeri) {
        // if player is not dropped then count on active roster
        seriGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this,
            {
              player: player,
              manager: manager || null
            }
          ));
          player.seriGameLog = result.data.filter($arrayFilter.filterAfterDate).map(arrayMaper.gameMapper);
          player.domesticLeagueName = $textManipulator.formattedLeagueName('seri');
          if (manager) {
            if (player.status !== 'dropped') manager.seriCount += 1;
            manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
            manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
          }
        });
      }

      if (validLeagues.inChlg) {
        chlgGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this,
            {
              player: player,
              manager: manager || null
            }
          ));
          player.chlgGameLog = result.data.filter($arrayFilter.filterAfterDate).map(arrayMaper.gameMapper);
          player.tournamentLeagueName = $textManipulator.formattedLeagueName('chlg');
          if (manager) {
            manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
            manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
          }
        });
      }

      if (validLeagues.inEuro) {
        euroGamesRequest.promise.then(function (result) {
          var newInfo = result.data.filter($arrayFilter.filterOnValidGoals.bind(this, player)).map(arrayMaper.monthlyMapper.bind(this,
            {
              player: player,
              manager: manager || null
            }
          ));
          player.euroGameLog = result.data.filter($arrayFilter.filterAfterDate).map(arrayMaper.gameMapper);
          player.tournamentLeagueName = $textManipulator.formattedLeagueName('uefa');
          if (manager) {
            manager.monthlyGoalsLog = manager.monthlyGoalsLog.concat(newInfo);
            manager.filteredMonthlyGoalsLog = manager.filteredMonthlyGoalsLog.concat(newInfo);
          }
        });
      }

      // logical definition for a wildcard player
      if ((validLeagues.inChlg || validLeagues.inEuro) && !validLeagues.inLiga && !validLeagues.inEPL && !validLeagues.inSeri) {
        // if player is not dropped then count on active roster
        if (player.status !== 'dropped' && manager) {
          console.log('IN WILDCARD');
          manager.wildCardCount += 1;
        }
      }

    },

    /**
     * makes request for addition into a first param: player
     * including valid leagues, physical attributes
     * @param player - the player object, used in the loop to get sub property
     * @param onRequestFinished - callback function
     * @param result - result data passed in from api call
     */
    playerInfo: function (player, onRequestFinished, result) {

      var selectedInt = 0,
        playerLeagueProfileRequest,
        profileLeague = $textManipulator.getLeagueSlug(result);

      // url for team logo
      player.teamLogo = result.data.teams[selectedInt].sportsnet_logos.large;

      // url for player image
      player.playerImage = result.data.headshots.original;

      // returns a concat string with all valid leagues
      player.allLeaguesName = $textManipulator.validLeagueNamesFormatted(result);

      // based on player result data return an object with the valid leagues for this player
      player.validLeagues = $textManipulator.getPlayerValidLeagues(result);

      ///////////////////////////////////


      playerLeagueProfileRequest = $apiFactory.getPlayerProfile(profileLeague, player.id);
      playerLeagueProfileRequest.promise.then(function (profileData) {

        player.playerPos = profileData.data.position;
        player.weight = profileData.data.weight;
        player.height = profileData.data.height_feet + '\'' + profileData.data.height_inches;
        player.birthdate = profileData.data.birthdate;
        player.birthplace = profileData.data.birth_city + ', ' + profileData.data.birth_country;

        onRequestFinished();

      });

    },

    transferPlayersMap: function (allManagers, leagueData, teamData, i) {

      var playerObject = {
        id: i.id,
        playerName: $textManipulator.formattedFullName(i.first_name, i.last_name),
        managerName: $arrayLoopers.getOwnerByID(allManagers, i.id),
        teamName: $textManipulator.stripVowelAccent(teamData.full_name).toUpperCase(),
        leagueName: $textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase()
      };

      //console.log('TEAM:', teamData.full_name + ',', ' PLAYER:', playerObject.playerName);

      //var playerProfileRequest = $apiFactory.getPlayerProfile('soccer', player.id);
      //playerProfileRequest.promise.then(arrayMapper.playerInfo.bind(this, playerObject));

      return playerObject;

    },

    monthlyMapper: function (dataObj, game, index) {

      var gameMapsObj = {
        index: index,
        id: dataObj.player.id,
        alignment: game.alignment === 'away' ? '@' : 'vs',
        vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
        goalsScored: game.goals || 0,
        leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
        leagueSlug: game.box_score.event.league.slug,
        datePlayed: $dateService.goalLogDate(game.box_score.event.game_date),
        rawDatePlayed: $date.create(game.box_score.event.game_date),
        originalDate: game.box_score.event.game_date,
        playerName: $textManipulator.stripVowelAccent(dataObj.player.playerName),
        managerName: dataObj.player.managerName || 'N/A',
        result: $textManipulator.result.call(gameMapsObj, game),
        finalScore: $textManipulator.finalScore.call(gameMapsObj, game)
      };

      var gameGoals = gameMapsObj.goalsScored,
        leagueSlug = gameMapsObj.leagueSlug,
        computedPoints;

      //console.log('slug:', game.box_score.event.league.slug);
      //console.log('leagueSlug:', leagueSlug);
      //console.log('leagueName:', gameMapsObj.leagueName);

      dataObj.player.leagueName = gameMapsObj.leagueName;

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

        //console.log('player:', dataObj.player);
        //console.log('----------------------------------');

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
        datePlayed: $dateService.goalLogDate(game.box_score.event.game_date),
        rawDatePlayed: $date.create(game.box_score.event.game_date),
        originalDate: game.box_score.event.game_date,
        result: $textManipulator.result.call(gameMapsObj, game),
        finalScore: $textManipulator.finalScore.call(gameMapsObj, game)
      };

      return gameMapsObj;

    }

  };

  return arrayMaper;

});