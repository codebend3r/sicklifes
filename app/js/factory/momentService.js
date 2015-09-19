/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$momentService', function ($moment, $log) {

      return {

        getDate: function (date) {
          return $moment(date);
        },

        leagueStartDate: function() {
          return $moment(new Date('August 1 2015')).format('M/D/YYYY h:mm:ss a');
        },

        syncDate: function () {
          return $moment().format('M/D/YYYY h:mm:ss a');
        },

        chartDate: function (date) {
          return $moment(new Date(date)).format('M/D/YYYY');
        },

        goalDate: function () {
          return $moment().format('M/D/YYYY');
        },

        getUnixTime: function (date) {
          date = date || '';
          return $moment(new Date(date)).getTime();
        },

        transactionDate: function (date) {
          if (date) {
            return date;
          } else {
            return $moment().format('M/D/YYYY');
          }
        },

        goalLogDate: function (date) {
          return $moment(new Date(date)).format('M/D/YYYY');
        },

        /**
         * checks to see if the current date and the sync date is past 22 hours
         * @param syncDate
         * @returns {boolean}
         */
        isPastYesterday: function (syncDate) {

          //console.log('syncDate', syncDate);
          var thenMoment = $moment(new Date(syncDate.split(' ')[0]));
          var nowMoment = $moment();
          var diff = nowMoment.diff(thenMoment, 'hours');

          //$log.log('sync time difference in hours:', diff, '-->', thenMoment.fromNow());

          return diff > 22;

        }

      };

    });

})();
