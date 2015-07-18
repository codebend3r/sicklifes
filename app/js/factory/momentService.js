(function () {

  angular.module('sicklifes')

    .factory('$momentService', function ($moment) {

      return {

        getDate: function (date) {
          return $moment(date);
        },

        syncDate: function () {
          return $moment().format('M/D/YYYY h:mm:ss a');
        },

        chartDate: function (date) {
          return $moment(date).format('M/D/YYYY h:mm:ss a');
        },

        goalDate: function () {
          return $moment().format('M/D/YYYY h:mm:ss a');
        },

        getUnixTime: function (date) {
          date = date || '';
          return $moment(date).getTime();
        },

        transactionDate: function (date) {
          if (date) {
            return date;
          } else {
            return $moment().format('M/D/YYYY h:mm:ss a');
          }
        },

        goalLogDate: function (gameDate) {
          return $moment(gameDate).format('M/D/YYYY h:mm:ss a');
        },

        /**
         * checks to see if the current date and the sync date is past 22 hours
         * @param syncDate
         * @returns {boolean}
         */
        isPastYesterday: function (syncDate) {

          console.log('syncDate', syncDate);
          var thenMoment = $moment(new Date(syncDate.split(' ')[0]));
          var nowMoment = $moment();          
          var diff = nowMoment.diff(thenMoment, 'hours');

          console.log('sync time difference in hours:', diff, '-->', thenMoment.fromNow());

          return diff > 22;

        }

      };

    });

})();