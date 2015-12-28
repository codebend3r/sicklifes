/**
 * Created by Bouse on 12/28/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .filter('orderObjectBy', function () {
      return function (items, field, reverse) {
        var filtered = [];
        _.each(items, function (item) {
          filtered.push(item);
        });
        filtered.sort(function (a, b) {
          return (a[field] > b[field] ? 1 : -1);
        });
        if (reverse) filtered.reverse();
        return filtered;
      };
    });



})();
