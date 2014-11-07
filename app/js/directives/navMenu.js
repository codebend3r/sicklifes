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
        return $location.path().contains('player-details') && viewLocation === '/managers/' || viewLocation === $location.path();
      };

    }
  }

});