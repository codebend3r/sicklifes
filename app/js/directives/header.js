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
              name: 'Leagues',
              url: 'leagues.tables',
              active: true
            },
            {
              name: 'Fantasy',
              active: true,
              subMenu: [
                {
                  name: 'Managers',
                  url: 'managers.overview',
                  active: true
                },
                {
                  name: 'Standings',
                  url: 'standings',
                  active: true
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
