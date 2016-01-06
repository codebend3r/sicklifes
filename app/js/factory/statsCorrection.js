/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('statsCorrection', function () {

      var statsCorrection = {};

      statsCorrection.events = {
        seri: {
          game: {
            leagueSlug: 'seri',
            gameId: 28151164,
            playerId: 18403,
            statType: 'goals',
            goals: 1
          }
        },
        epl: {},
        liga: {},
        chlg: {},
        euro: {}
      };

      return statsCorrection;

    });

})();
