/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('scoringLogic', function ($moment) {

      return {

        calculatePoints: function (goals, league, date) {

          var leagueStart = $moment('2015 08 01');
          var datePlayed = $moment(date);
          var roundOf32;
          var roundOf16;
          var roundOfSixteen;
          var quarterFinals;
          var semiFinals;
          var finals;

          if (league === 'uefa' || league === 'europa') {

            roundOf32 = $moment('2016 02 15');
            roundOf16 = $moment('2016 03 10');
            quarterFinals = $moment('2016 04 07');
            semiFinals = $moment('2016 04 28');
            finals = $moment('2016 05 18');

            if (datePlayed.isBefore(roundOf32)) {
              return goals * 1;
            } else if (datePlayed.isBetween(roundOf32, quarterFinals)) {
              return goals * 2;
            } else if (datePlayed.isBetween(quarterFinals, semiFinals)) {
              return goals * 3;
            } else if (datePlayed.isBetween(semiFinals, finals)) {
              return goals * 4;
            } else if (datePlayed.isAfter(finals)) {
              return goals * 5;
            } else {
              return goals * 1;
            }

          } else if (league === 'chlg') {

            roundOfSixteen = $moment('2016 02 15');
            quarterFinals = $moment('2016 04 05');
            semiFinals = $moment('2016 04 26');
            finals = $moment('2016 05 28');

            if (datePlayed.isBefore(roundOfSixteen)) {
              return goals * 2;
            } else if (datePlayed.isBetween(roundOfSixteen, quarterFinals)) {
              return goals * 3;
            } else if (datePlayed.isBetween(quarterFinals, semiFinals)) {
              return goals * 4;
            } else if (datePlayed.isBetween(semiFinals, finals)) {
              return goals * 5;
            } else if (datePlayed.isAfter(finals)) {
              return goals * 6;
            } else {
              return goals * 2;
            }

          } else {
            return goals * 2;
          }
        }

      };

    });

})();
