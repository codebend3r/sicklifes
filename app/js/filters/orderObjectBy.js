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
          if (field.indexOf('.')) {
            var keys = field.split('.');
            return (a[keys[0]][keys[1]] > b[keys[0]][keys[1]] ? 1 : -1);
          } else {
            return (a[field] > b[field] ? 1 : -1);
          }
        });
        if (reverse) filtered.reverse();
        return filtered;
      };
    });

})();
