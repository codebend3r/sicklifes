/**
 * Created by Bouse on 09/01/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes', [

    'ui.router',
    'ui.router.tabs',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'UserApp',
    'jsonFormatter',
    'firebase',
    'ui.bootstrap',
    'angular.filter'

  ])

  .constant('$moment', moment)

  .run(function(user) {
    user.init({ appId: '55e67bdde35f9' });
    //user.init({ appId: '5482b3c1ebdc7' });
  });

})();
