/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .factory('$momentService', function ($moment, $log) {

      return {

        getDate: function (date) {
          return $moment(new Date(date));
        },

        leagueStartDate: function() {
          return $moment(new Date('August 1 2015')).format('MM/DD/YYYY h:mm:ss a');
        },

        syncDate: function () {
          return $moment().format('MM/DD/YYYY h:mm:ss a');
        },

        chartDate: function (date) {
          if (date) {
            return $moment(new Date(date)).format('MM/DD/YYYY');
          } else {
            return $moment().format('MM/DD/YYYY');
          }
        },

        goalDate: function () {
          return $moment().format('MM/DD/YYYY');
        },

        getUnixTime: function (date) {
          date = date || '';
          return $moment(new Date(date)).getTime();
        },

        transactionDate: function (date) {
          if (date) {
            return date;
          } else {
            return $moment().format('MM/DD/YYYY');
          }
        },

        goalLogDate: function (date) {
          return $moment(new Date(date)).format('MM/DD/YYYY');
        },

        /**
         * compares two dates and returns true if past 4 hours ago
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
         * checks to see if the current date and the sync date is past 22 hours
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
