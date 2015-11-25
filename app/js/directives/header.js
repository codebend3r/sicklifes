/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('header', function () {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/header.html',
        scope: true,
        controller: function ($scope) {

          $scope.menuOptions = [
            {
              name: 'Managers',
              url: 'managers',
              active: true
            },
            {
              name: 'Standings',
              url: 'standings',
              active: true
            },
            {
              name: 'Leagues',
              url: 'leagues',
              active: true
            },
            {
              name: 'Transfers',
              url: 'transfers',
              active: true
            },
            {
              name: 'Admin',
              url: 'admin',
              active: false
            }
          ];

        }
      };

    });

})();
