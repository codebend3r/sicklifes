/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('scoringLogic', function ($moment) {

      return {

        calculatePoints: function (goals, league, datePlayed) {

          var leagueStart = $moment('2015 08 01');
          var datePlayed = $moment(datePlayed);

          if (league === 'uefa' || league === 'europa') {

            var roundOf32 = $moment('2016 02 15');
            var roundOf16 = $moment('2016 03 10');
            var quarterFinals = $moment('2016 04 07');
            var semiFinals = $moment('2016 04 28');
            var finals = $moment('2016 05 18');

            if (datePlayed.isBefore(roundOf32)) {
              //console.log('group stage goal');
              return goals * 1;
            } else if (datePlayed.isBetween(roundOf32, quarterFinals)) {
              //console.log('europa round of 16 or 32 goal');
              return goals * 2;
            } else if (datePlayed.isBetween(quarterFinals, semiFinals)) {
              console.log('europa quarter finals goal');
              return goals * 3;
            } else if (datePlayed.isBetween(semiFinals, finals)) {
              console.log('europa semi finals goal');
              return goals * 4;
            } else if (datePlayed.isAfter(finals)) {
              console.log('europa finals goal');
              return goals * 5;
            } else {
              return goals * 1;
            }

          } else if (league === 'chlg') {

            var roundOfSixteen = $moment('2016 02 15');
            var quarterFinals = $moment('2016 04 05');
            var semiFinals = $moment('2016 04 26');
            var finals = $moment('2016 05 28');

            if (datePlayed.isBefore(roundOfSixteen)) {
              //console.log('group stage goal');
              return goals * 2;
            } else if (datePlayed.isBetween(roundOfSixteen, quarterFinals)) {
              //console.log('chlg round of 16 goal');
              return goals * 3;
            } else if (datePlayed.isBetween(quarterFinals, semiFinals)) {
              console.log('chlg quarter finals goal');
              return goals * 4;
            } else if (datePlayed.isBetween(semiFinals, finals)) {
              console.log('chlg semi finals goal');
              return goals * 5;
            } else if (datePlayed.isAfter(finals)) {
              console.log('chlg finals goal');
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
