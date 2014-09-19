/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('navMenu', function ($location) {

  return {
    restrict: 'E',
    replace: false,
    scope: {},
    templateURL: 'views/directives/nav.html',
    link: function ($scope) {

      $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
      };

    }
  }

});
