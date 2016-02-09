/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('momentService', function ($moment, $log) {

      return {

        getDate: function (date) {
          return $moment(new Date(date).toISOString());
        },

        leagueStartDate: function() {
          return $moment(new Date('August 1 2015').toISOString()).format('YYYY/MM/DD h:mm:ss a');
        },

        syncDate: function () {
          return $moment().format('YYYY/MM/DD h:mm:ss a');
        },

        chartDate: function (date) {
          if (date) {
            return $moment(new Date(date).toISOString()).format('YYYY/MM/DD');
          } else {
            return $moment().format('YYYY/MM/DD');
          }
        },

        goalDate: function () {
          return $moment().format('YYYY/MM/DD');
        },

        getUnixTime: function (date) {
          date = date || '';
          return $moment(new Date(date).toISOString()).getTime();
        },

        transactionDate: function (date) {
          if (angular.isDefined(date)) {
            return $moment(date).format('YYYY/MM/DD');
          } else {
            return $moment().format('YYYY/MM/DD');
          }
        },

        goalLogDate: function (date) {
          return $moment(new Date(date).toISOString()).format('YYYY/MM/DD');
        },

        /**
         * @description compares two dates and returns true if past 4 hours ago
         * @param syncDate
         * @returns {boolean}
         */
        isHoursAgo: function (syncDate) {

          var thenMoment = $moment(new Date(syncDate));
          var nowMoment = $moment();
          var diff = nowMoment.diff(thenMoment, 'minutes');

          return diff > 240;

        },

        /**
         * @description checks to see if the current date and the sync date is past 22 hours
         * @param syncDate
         * @returns {boolean}
         */
        isPastYesterday: function (syncDate) {

          var thenMoment = $moment(new Date(syncDate));
          var nowMoment = $moment();
          var diff = nowMoment.diff(thenMoment, 'hours');

          return diff > 22;

        }

      };

    });

})();
