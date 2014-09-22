/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$scoringLogic', function () {

  return {

    calculatePoints: function (goals, league) {
      league = league.toLowerCase();
      league = league.replace(/^\/|\/$/g, '');
      if (league === 'uefa' || league === 'europa') {
        return goals * 1;
      } else {
        return goals * 2;
      }
    }

  }

});