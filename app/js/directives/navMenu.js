/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes')

    .directive('navMenu', function ($location, user) {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/nav.html',
        scope: true,
        controller: function ($scope) {

          $scope.menuOptions = [
            {
              name: 'Leagues',
              url: 'leagues',
              active: true
            },
            {
              name: 'Fantasy',
              active: true,
              subMenu: [
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
                  active: false
                }
              ]
            },
            {
              name: 'Transfers',
              url: 'transfers',
              active: false
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
