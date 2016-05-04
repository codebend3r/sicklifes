/**
 * Created by Bouse on 04/30/2016
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .filter('capitalize', function () {
      return function (input) {
        return _.isDefined(input) && input.capitalize();
      };
    });

})();
