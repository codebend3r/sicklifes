/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$arrayLoopers', function () {

  return {

    goalsMap: function (url, i) {

      var playerInLeague = {
        id: i.player.id,
        url: url || '',
        rank: i.ranking,
        playerName: i.player.full_name,
        teamName: function () {
          return i.team.full_name.toUpperCase();
        },
        domesticGoals: 0,
        leagueGoals: 0,
        goals: i.stat,
        league: '',
        transactionsLog: [],
        historyLog: []
      };

      if (url.contains('liga')) {
        playerInLeague.league = 'liga';
      } else if (url.contains('epl')) {
        playerInLeague.league = 'epl';
      } else if (url.contains('seri')) {
        playerInLeague.league = 'seri';
      } else if (url.contains('chlg')) {
        playerInLeague.league = 'chlg';
      } else if (url.contains('uefa')) {
        playerInLeague.league = 'uefa';
      } else {
        return 'unknown';
      }

      return playerInLeague;

    }

  }

});