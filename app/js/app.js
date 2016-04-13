/**
 * Created by Bouse on 10/29/2015
 */

(function () {

  'use strict';

  angular.module('sicklifes', [

    'ui.router',
    'ui.router.tabs',
    'ui.bootstrap',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    //'UserApp',
    'jsonFormatter',
    'firebase',
    'angular.filter'

  ]);

  angular.module('sicklifes')

    .constant('$moment', moment);


  // $(function () {
  //   var navMain = $("#navbar");
  //   navMain.on('click', 'a', null, function () {
  //     $('#navbar').removeClass('in')
  //   });
  // });


})();
