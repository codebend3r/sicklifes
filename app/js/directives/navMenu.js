/**
 * Created by Bouse on 10/2/2014
 */


sicklifesFantasy.directive('navMenu', function ($location) {

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
          url: '#/leagues/'
        },
        {
          name: 'Managers',
          url: '#/managers/'
        },
        {
          name: 'Standings',
          url: '#/standings/'
        },
        {
          name: 'Monthly Winners',
          url: '#/monthlywinners/'
        },
        {
          name: 'Transfers',
          url: '#/transfers/'
        }
      ];

    }
  }

});