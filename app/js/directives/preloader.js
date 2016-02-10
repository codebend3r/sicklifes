/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('preloader', function () {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/preloader.html'
      };

    });

})();
