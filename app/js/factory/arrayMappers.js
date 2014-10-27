/**
 * Created by Bouse on 10/24/2014
 */
 
sicklifesFantasy.factory('$arrayMappers', function ($textManipulator, $q, $scoringLogic, $arrayLoopers, $date) {

  var mapper = {

    /**
     * TODO
     * @param $url
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
        ownedBy: $arrayLoopers.getOwnerByID(i.player.id),
        league: '',
        transactionsLog: [],
        historyLog: []
      };

      playerInLeague.league = $textManipulator.getLeagueByURL(url);
      return playerInLeague;

    },

    /**
     * TODO
     */
    gameMapper: function (game) {

      var gameMapsObj = {
        alignment: game.alignment === 'away' ? '@' : 'vs',
        vsTeam: game.alignment === 'away' ? game.box_score.event.home_team.full_name : game.box_score.event.away_team.full_name,
        result: function () {

          var result = '';

          if (game.alignment === 'away') {
            if (game.box_score.score.away.score > game.box_score.score.home.score) {
              result = 'W';
            } else if (game.box_score.score.away.score < game.box_score.score.home.score) {
              result = 'L';
            } else {
              result = 'T';
            }
          } else {
            if (game.box_score.score.away.score < game.box_score.score.home.score) {
              result = 'W';
            } else if (game.box_score.score.away.score > game.box_score.score.home.score) {
              result = 'L';
            } else {
              result = 'T';
            }
          }

          return result;

        },
        finalScore: function () {

          var final = '';

          if (game.alignment === 'away') {
            final += game.box_score.score.away.score;
            final += '-' + game.box_score.score.home.score;
          } else {
            final += game.box_score.score.home.score;
            final += '-' + game.box_score.score.away.score;
          }

          return final;

        },
        goalsScored: game.goals || '-',
        leagueName: $textManipulator.formattedLeagueName(game.box_score.event.league.slug),
        datePlayed: $date.create(game.box_score.event.game_date).format('{dd}/{MM}/{yy}')
      };

      return gameMapsObj;

    }

  };

  return mapper;

});