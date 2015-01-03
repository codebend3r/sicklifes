/**
 * Created by Bouse on 11/05/2014
 */

sicklifesFantasy.factory('$dateService', function ($date) {

  return {

    syncDate: function () {
      return $date.create().format('{yyyy}/{MM}/{dd} {12hr}:{mm}:{ss}{tt}');
    },

    goalDate: function () {
      return $date.create().format('{yyyy}/{MM}/{dd}');
    },

    transactionDate: function (date) {
      if (date) {
        return date;
      } else {
        return $date.create().format('{yyyy}/{MM}/{dd}');
      }
    },

    goalLogDate: function (gameDate) {
      return $date.create(gameDate).format('{yyyy}/{MM}/{dd}')
    }

  }

});