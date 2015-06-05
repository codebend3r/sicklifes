(function () {

  angular.module('sicklifes')

    .directive('preloader', function () {

      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/directives/preloader.html',
        scope: {
          loading: '='
        }
      };

    });

})();
