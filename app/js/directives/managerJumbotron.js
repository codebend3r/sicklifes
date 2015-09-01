/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('managerJumbotron', function () {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/manager-jumbotron.html',
        scope: {
          manager: '=',
          selectedMonth: '='
        }
      };

    });

})();
