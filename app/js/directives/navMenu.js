/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('navMenu', function ($location, user) {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/directives/nav.html',
        scope: true,
        link: function ($scope) {

          $scope.menuOptions = [
            {
              name: 'Leagues',
              url: 'leagues',
              active: true
            },
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
              name: 'Monthly Winners',
              url: 'monthlyWinners',
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
