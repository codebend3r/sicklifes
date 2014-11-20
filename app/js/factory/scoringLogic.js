/**
 * Created by Bouse on 10/2/2014
 */

sicklifesFantasy.factory('$scoringLogic', function () {

  return {

    calculatePoints: function (goals, league, debug) {
      debug = debug || false;
      league = league.toLowerCase();
      league = league.replace(/^\/|\/$/g, '');

      if (debug) console.log(goals, 'goals for league:', league);

      if (league === 'uefa' || league === 'europa') {
        if (debug) {
          console.log('return 1 point');
        }
        return goals * 1;
      } else {
        if (debug) {
          console.log('return 2 point');
        }
        //return goals * 1;
        return goals * 2;
      }
    },

    findOwnerByID: function (id) {
      //TODO
    }

  }

});