/**
 * Created by Bouse on 10/2/2014
 */



sicklifesFantasy.factory('$arrayLoopers', function ($textManipulator, localStorageService, $leagueTeams) {

  var arrayLoopers = {

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
        ownedBy: arrayLoopers.getOwnerByID(i.player.id),
        league: '',
        transactionsLog: [],
        historyLog: []
      };

      playerInLeague.league = $textManipulator.getLeagueByURL(url);
      return playerInLeague;

    },

    getAllPlayers: function() {
      return [
        $leagueTeams.chester,
        $leagueTeams.frank,
        $leagueTeams.dan,
        $leagueTeams.justin,
        $leagueTeams.mike,
        $leagueTeams.joe
      ];
    },

    getOwnerByID: function(id) {
      var owner = 'Free Agent';
      arrayLoopers.getAllPlayers().forEach(function(team) {
        team.players.some(function(p) {
          if (p.id === id) {
            owner = team.personName;
            return p.id === id
          }
        });
      });      
      return owner;
    }

  }

  return arrayLoopers;

});
