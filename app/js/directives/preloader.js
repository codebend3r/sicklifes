/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('preloader', function ($rootScope) {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/preloader.html',
        scope: true,
        controller: function ($scope, $element, $attrs) {

          $scope.percentage = 0;

          $rootScope.$watch('percentage', function (newValue) {
            $scope.percentage = newValue;
            if ($scope.percentage === 1) {
              $scope.percentage = 0;
            }
          });

          $scope.loading = $scope.$eval($attrs.loading);

          $rootScope.$watch('loading', function (newValue) {
            $scope.loading = newValue;
          });

        }
      };

    });

})();
