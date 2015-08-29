(function () {

  angular.module('sicklifes', [

    'ui.router',
    'ui.router.tabs',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    //'UserApp',
    'jsonFormatter',
    'firebase',
    'ui.bootstrap',
    'angular.filter'

  ])

  .constant('$moment', moment);

})();
