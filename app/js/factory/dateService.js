/**
 * Created by Bouse on 01/19/2014
 */

angular.module('sicklifes')

  .factory('$dateService', function ($date) {

    return {

      getDate: function (date) {
        return $date.create(date);
      },

      syncDate: function () {
        return $date.create().format('{yyyy}/{MM}/{dd} {12hr}:{mm}:{ss}{tt}');
      },

      chartDate: function (date) {
        return $date.create(date).format('{MM}/{dd}/{yyyy}');
      },

      goalDate: function () {
        return $date.create().format('{yyyy}/{MM}/{dd}');
      },

      getUnixTime: function (date) {
        date = date || '';
        return $date.create(date).getTime();
      },

      transactionDate: function (date) {
        if (date) {
          return date;
        } else {
          return $date.create().format('{yyyy}/{MM}/{dd}');
        }
      },

      goalLogDate: function (gameDate) {
        return $date.create(gameDate).format('{yyyy}/{MM}/{dd}');
      }

    };

  });
