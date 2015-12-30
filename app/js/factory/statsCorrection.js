/**
 * Created by Bouse on 12/30/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('statsCorrection', function () {

      var statsCorrection = {};

      statsCorrection.correction = {

        chester: {
          event: {
            gameId: 28151164,
            playerId: 18403,
            goals: 1
          }
        },
        frank: {},
        justin: {},
        joe: {},
        mike: {},
        dan: {}

      };

      return statsCorrection;

    });

})();
