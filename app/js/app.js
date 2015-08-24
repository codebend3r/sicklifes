(function () {

  angular.module('sicklifes', [

    'ui.router',
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

  console.log('sicklifes --> module');

})();
