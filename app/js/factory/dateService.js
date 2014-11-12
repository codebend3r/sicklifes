/**
 * Created by Bouse on 11/05/2014
 */

sicklifesFantasy.factory('$dateService', function ($date) {

  return {

    syncDate: function () {
      return $date.create().format('{MM}/{dd}/{yy} {12hr}:{mm}:{ss}{tt}');
    },

    goalDate: function () {
      return $date.create().format('{MM}/{dd}/{yy}');
    },

    transactionDate: function () {
      return $date.create().format('{MM}/{dd}/{yy}');
    }

    //transactionDate

  }

});