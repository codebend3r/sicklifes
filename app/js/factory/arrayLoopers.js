/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.factory('$arrayLoopers', function ($textManipulator) {

  return {

    goalsMap: function (url, i) {

      //console.log('i >> ', i);

      var playerInLeague = {
        id: i.player.id,
        url: url || '',
        rank: i.ranking,
        playerName: $textManipulator.stripVowelAccent((i.player.first_name !== null ? i.player.first_name : '') + ' ' + i.player.last_name.toUpperCase()),
        teamName: i.team.full_name.toUpperCase(),
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
