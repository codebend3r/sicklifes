/**
 * Created by Bouse on 01/23/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('transferDates', function () {

      var transferDates = {};

      transferDates.leagueStart = {
        date: '2015/08/01'
      };

      transferDates.transfers = {
        round1: {
          name: 'Round 1',
          roundCompleted: true,
          pick: 25,
          date: '2015/11/15'
        },
        round2: {
          name: 'Round 2',
          roundCompleted: true,
          pick: 26,
          date: '2015/11/22'
        },
        round3: {
          name: 'Round 3',
          roundCompleted: true,
          pick: 27,
          date: '2015/11/29'
        },
        round4: {
          name: 'Round 4',
          roundCompleted: false,
          pick: 28,
          date: '2015/02/16'
        },
        round5: {
          name: 'Round 5',
          roundCompleted: false,
          pick: 29,
          date: '2015/02/23'
        },
        round6: {
          name: 'Round 6',
          roundCompleted: false,
          pick: 30,
          date: '2015/03/01'
        }
      };

      return transferDates;

    });

})();
