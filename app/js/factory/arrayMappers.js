/**
 * Created by Bouse on 10/24/2014
 */

sicklifesFantasy.factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $arrayLoopers, $date) {

  var mapper = {

    /**
     * maps each player's stats
     * @param url
     * @param i
     */
    goalsMap: function (url, i) {

      var playerInLeague = {
        id: i.player.id,
        url: url || '',
        rank: i.ranking,
        playerName: $textManipulator.formattedFullName(i.player.first_name, i.player.last_name),
        teamName: i.team.full_name.toUpperCase(),
        domesticGoals: 0,
        leagueGoals: 0,
        goals: i.stat,
        status: 'active',
        ownedBy: $arrayLoopers.getOwnerByID(i.player.id) || 'N/A',
        leagueName: $textManipulator.getLeagueByURL(url),
        transactionsLog: [],
        historyLog: []
      };

      //playerInLeague.league = $textManipulator.getLeagueByURL(url);
      return playerInLeague;

    },

    transferPlayersMap: function (leagueData, teamData, i) {

      var playerInLeague = {
        id: i.id,
        playerName: $textManipulator.formattedFullName(i.first_name, i.last_name),
        ownedBy: $arrayLoopers.getOwnerByID(i.id) || 'N/A',
        teamName: teamData.full_name.toUpperCase(),
        leagueName: $textManipulator.getLeagueByURL(leagueData.leagueURL).toUpperCase(),
        transactionsLog: [],
        historyLog: []
      };

      return playerInLeague;

    },

    monthlyMapper: function (manager, player, game) {

      var gameMapsObj = {
        id: player.id,
        alignment: game.alignment === 'away' ? '@' : 'vs',
        vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
        goalsScored: game.goals || 0,
        leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
        leagueSlug: game.box_score.event.league.slug,
        datePlayed: $date.create(game.box_score.event.game_date).format('{MM}/{dd}/{yy}'),
        rawDatePlayed: $date.create(game.box_score.event.game_date),
        originalDate: game.box_score.event.game_date,
        playerName: player.playerName,
        managerName: manager.managerName,
        result: $textManipulator.result.call(gameMapsObj, game),
        finalScore: $textManipulator.finalScore.call(gameMapsObj, game)
      };

      var gameGoals = gameMapsObj.goalsScored,
        leagueSlug = gameMapsObj.leagueSlug,
        computedPoints;

      player.leagueName = gameMapsObj.leagueName;

      if ($textManipulator.acceptedLeague(leagueSlug)) {

        computedPoints = $scoringLogic.calculatePoints(gameGoals, leagueSlug);

        if ($textManipulator.isLeagueGoal(leagueSlug)) {
          //player.leagueGoals += gameGoals;
        }

        if ($textManipulator.isDomesticGoal(leagueSlug)) {

          player.domesticGoals += gameGoals;
          manager.domesticGoals += gameGoals;

        } else if ($textManipulator.isChampionsLeagueGoal(leagueSlug)) {

          player.clGoals += gameGoals;
          manager.clGoals += gameGoals;

        } else if ($textManipulator.isEuropaGoal(leagueSlug)) {

          player.eGoals += gameGoals;
          manager.eGoals += gameGoals;

        }

        // increment goals for each player
        player.goals += gameGoals;

        // increment goals for the manager
        manager.totalGoals += gameGoals;

        // increment points
        player.points += computedPoints;
        manager.totalPoints += computedPoints;

        //console.log(manager.managerName, 'GOALS', manager.totalGoals);
        //console.log(manager.managerName, 'POINTS', manager.totalPoints);
        //console.log(player.playerName, 'has', player.points, 'points in', player.leagueName, 'league.');
        //if (manager.managerName === 'Chester' && player.playerName === 'Juan CUADRADO') {
          //console.log(Math.random() * 10, manager.managerName, '|', player.playerName, 'scored', game.goals, 'goals in', player.leagueName, '| manager totalGoals', manager.totalGoals);
        //}
        //console.log(player.playerName, 'scored', gameGoals, 'for', computedPoints, 'points', 'in', league, 'league on', gameMapsObj.datePlayed);

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
        result: $textManipulator.result.bind(gameMapsObj, game),
        finalScore: $textManipulator.finalScore.bind(gameMapsObj, game),
        goalsScored: game.goals || 0,
        leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
        datePlayed: $date.create(game.box_score.event.game_date).format('{MM}/{dd}/{yy}'),
        rawDatePlayed: $date.create(game.box_score.event.game_date),
        originalDate: game.box_score.event.game_date
      };

      return gameMapsObj;

    }

  };

  return mapper;

});