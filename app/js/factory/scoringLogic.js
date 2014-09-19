/**
 * Created by crivas on 9/12/2014.
 */

sicklifesFantasy.factory('$scoringLogic', function () {

  return {

    calculatePoints: function (goals, league) {
      if (league === 'EUROPA') {
        return goals * 1;
      } else {
        return goals * 2;
      }
    }

  }

});