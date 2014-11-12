/**
 * Created by Bouse on 9/18/2014.
 */

sicklifesFantasy.directive('preloader', function () {

  return {
    restrict: 'E',
    replace: false,
    templateUrl: 'views/directives/preloader.html',
    scope: {
      loading: '='
    }
  }

});
