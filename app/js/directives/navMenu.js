(function () {

  angular.module('sicklifes')

    .directive('navMenu', function ($location) {

      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/directives/nav.html',
        scope: {},
        link: function ($scope) {

          $scope.isActive = function (viewLocation) {
            //console.log(viewLocation, 'contains', $location.path(), '? ', viewLocation.contains($location.path()));
            return $location.path().contains('player-details') && viewLocation === '/managers/' || viewLocation.contains($location.path());
          };

          $scope.menuOptions = [
            {
              name: 'Leagues',
              url: '#/leagues/',
              active: true
            },
            {
              name: 'Managers',
              url: '#/managers/',
              active: true
            },
            {
              name: 'Standings',
              url: '#/standings/',
              active: true
            },
            {
              name: 'Monthly Winners',
              url: '#/monthlywinners/',
              active: true
            },
            {
              name: 'Transfers',
              url: '#/transfers/',
              active: true
            },
            {
              name: 'Admin',
              url: '#/admin/',
              active: false
            }
          ];

        }
      };

    });

})();