/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$arrayMapper', function () {

  return {

    goalsMap: function (i) {

      var league = {
        id: i.player.id,
        rank: i.ranking,
        playerName: i.player.full_name,
        teamName: i.team.full_name,
        goals: i.stat,
        league: i.league,
        game: null
      };

      return league;

    }

  }

});